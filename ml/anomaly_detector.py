"""
MPLADS Fund Utilization & Anomaly Detection Module
--------------------------------------------------
Initial Anomaly Detection using Scikit-Learn Isolation Forest.

IMPORTANT DISCLAIMER:
    Flagged records represent statistical outliers and divergence patterns
    (e.g., high expenditure velocity relative to recorded physical progress)
    designed solely to prioritize projects for administrative audit and
    human verification. A flag does NOT constitute evidence, proof, or
    allegation of fraud, corruption, or wrongdoing.
"""

import os
import sys
import argparse
import logging
from typing import Dict, List, Optional, Tuple, Any

import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
logger = logging.getLogger("MPLADS_AnomalyDetector")

# Standard human review note attached to all audit outputs
HUMAN_REVIEW_DISCLAIMER = (
    "Flagged as statistical outlier for administrative inquiry. "
    "Requires human review. Does not imply corruption or fraud."
)


class MPLADSAnomalyDetector:
    """
    Isolation Forest Anomaly Detector tailored for MPLADS project tracking.
    Safely adapts to varying CSV schemas, handles null/invalid numbers,
    engineers discrepancy metrics, and outputs explainable audit flags.
    """

    # Flexible column mappings (case-insensitive)
    SCHEMA_MAPPINGS = {
        "project_id": [
            "project_id", "id", "work_code", "code", "workcode", "projectid", "prj_id"
        ],
        "title": [
            "title", "work_title", "project_title", "name", "work_name"
        ],
        "district": [
            "district", "district_name", "dist_name", "dst"
        ],
        "state": [
            "state", "state_name"
        ],
        "sanctioned_amount": [
            "sanctioned_amount", "sanction_amount", "sanctionamountlakhs",
            "sanctioned_amt", "sanctioned", "sanction_amt", "sanctionamount"
        ],
        "released_amount": [
            "released_amount", "releasedamountlakhs", "released_amt",
            "released", "funds_released", "releasedamount"
        ],
        "expenditure_amount": [
            "expenditure_amount", "expenditure", "expenditurelakhs",
            "expenditure_amt", "expended_amount", "funds_utilized", "expenditureamount"
        ],
        "physical_progress": [
            "physical_progress", "physicalprogress", "physical_progress_pct",
            "physical_progress_percent", "progress", "physical_pct"
        ],
        "financial_progress": [
            "financial_progress", "financialprogress", "financial_progress_pct",
            "financial_progress_percent", "financial_pct"
        ],
        "status": [
            "status", "project_status", "work_status"
        ],
    }

    def __init__(
        self,
        contamination: float = 0.15,
        n_estimators: int = 100,
        random_state: int = 42,
        max_samples: Any = "auto",
    ):
        """
        Initialize the anomaly detector.

        Args:
            contamination: Expected proportion of outliers in the dataset.
            n_estimators: Number of base estimators in the ensemble.
            random_state: Random state for deterministic reproducibility.
            max_samples: Number of samples to draw to train each estimator.
        """
        self.contamination = contamination
        self.n_estimators = n_estimators
        self.random_state = random_state
        self.max_samples = max_samples
        self.model: Optional[IsolationForest] = None
        self.feature_columns: List[str] = []
        self.column_map: Dict[str, str] = {}

    def resolve_columns(self, df: pd.DataFrame) -> Dict[str, str]:
        """
        Dynamically map incoming CSV column headers to canonical names.
        """
        df_cols_lower = {col.strip().lower(): col for col in df.columns}
        resolved: Dict[str, str] = {}

        for canonical, candidates in self.SCHEMA_MAPPINGS.items():
            for candidate in candidates:
                cand_lower = candidate.lower()
                if cand_lower in df_cols_lower:
                    resolved[canonical] = df_cols_lower[cand_lower]
                    break

        self.column_map = resolved
        logger.info(f"Resolved column mappings: {resolved}")
        return resolved

    def clean_and_prepare_features(self, df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.DataFrame]:
        """
        Safely clean incoming data, handle missing values, and engineer features.

        Returns:
            processed_df: DataFrame with original columns plus standardized and engineered fields.
            features_df: Matrix of numerical features fed to Isolation Forest.
        """
        resolved = self.resolve_columns(df)
        processed = df.copy()

        # Helper to safely extract and clean numerical Series
        def get_clean_numeric(canonical_key: str, default_val: float = 0.0) -> pd.Series:
            if canonical_key in resolved:
                raw_col = resolved[canonical_key]
                cleaned = pd.to_numeric(processed[raw_col], errors="coerce")
                # Impute missing values with median if available, else default_val
                if cleaned.notna().sum() > 0:
                    cleaned = cleaned.fillna(cleaned.median())
                else:
                    cleaned = cleaned.fillna(default_val)
                return cleaned
            else:
                logger.warning(
                    f"Column for '{canonical_key}' not found in dataset. Using default value {default_val}."
                )
                return pd.Series(default_val, index=processed.index, dtype=float)

        # Extract canonical numerical variables
        sanctioned = get_clean_numeric("sanctioned_amount", 0.0)
        released = get_clean_numeric("released_amount", 0.0)
        expenditure = get_clean_numeric("expenditure_amount", 0.0)
        physical_prog = get_clean_numeric("physical_progress", 0.0)

        # Handle financial progress: use provided column if present, else derive
        if "financial_progress" in resolved:
            raw_fin_col = resolved["financial_progress"]
            financial_prog = pd.to_numeric(processed[raw_fin_col], errors="coerce")
            # If financial progress has missing items, derive them
            missing_fin = financial_prog.isna()
            derived_fin = np.where(sanctioned > 0, (expenditure / sanctioned) * 100.0, 0.0)
            financial_prog = financial_prog.fillna(pd.Series(derived_fin, index=processed.index))
        else:
            # Dynamically derive financial progress percentage
            financial_prog = pd.Series(
                np.where(sanctioned > 0, (expenditure / sanctioned) * 100.0, 0.0),
                index=processed.index,
                dtype=float
            )

        # Store canonical numerical versions for consistent downstream processing
        processed["_sanctioned"] = sanctioned
        processed["_released"] = released
        processed["_expenditure"] = expenditure
        processed["_physical_progress"] = physical_prog
        processed["_financial_progress"] = financial_prog

        # Feature 1: Progress Discrepancy (Financial Progress % - Physical Progress %)
        # Significant positive value indicates money has been claimed/spent far faster than physical works
        progress_discrepancy = financial_prog - physical_prog
        processed["progress_discrepancy"] = progress_discrepancy.round(2)

        # Feature 2: Expenditure to Sanction Ratio (detects budget overruns or excessive drawdowns)
        exp_to_sanction = np.where(sanctioned > 0, expenditure / sanctioned, 0.0)
        processed["exp_to_sanction_ratio"] = np.round(exp_to_sanction, 4)

        # Feature 3: Expenditure to Release Ratio (fund utilization velocity)
        exp_to_release = np.where(released > 0, expenditure / released, 0.0)
        # Cap extreme division spikes cleanly
        exp_to_release = np.clip(exp_to_release, 0.0, 10.0)
        processed["exp_to_release_ratio"] = np.round(exp_to_release, 4)

        # Feature 4: Physical Progress Index
        processed["physical_progress_norm"] = np.clip(physical_prog, 0.0, 100.0)

        # Feature 5: Absolute Expenditure Scale (Log-transformed to handle scale variance smoothly)
        processed["log_expenditure"] = np.log1p(np.maximum(expenditure, 0.0))

        # Build feature matrix for model
        feature_cols = [
            "progress_discrepancy",
            "exp_to_sanction_ratio",
            "exp_to_release_ratio",
            "physical_progress_norm",
            "log_expenditure",
        ]
        self.feature_columns = feature_cols
        features_df = processed[feature_cols].copy()

        # Final safety check: ensure no NaNs, Infs or nulls reach scikit-learn
        features_df = features_df.replace([np.inf, -np.inf], np.nan).fillna(0.0)

        return processed, features_df

    def fit(self, features_df: pd.DataFrame) -> "MPLADSAnomalyDetector":
        """
        Train the Isolation Forest model on the numerical feature matrix.
        """
        logger.info(
            f"Training IsolationForest (n_estimators={self.n_estimators}, "
            f"contamination={self.contamination}, random_state={self.random_state})"
        )
        self.model = IsolationForest(
            n_estimators=self.n_estimators,
            contamination=self.contamination,
            random_state=self.random_state,
            max_samples=self.max_samples,
        )
        self.model.fit(features_df)
        return self

    def generate_explanation(self, row: pd.Series) -> Tuple[str, str]:
        """
        Generate transparent, rule-assisted explanations for why a record was flagged.
        Returns: (category, detailed_explanation)
        """
        discrepancy = row.get("progress_discrepancy", 0.0)
        exp_sanction_ratio = row.get("exp_to_sanction_ratio", 0.0)
        phys_prog = row.get("_physical_progress", 0.0)
        fin_prog = row.get("_financial_progress", 0.0)
        expenditure = row.get("_expenditure", 0.0)
        sanctioned = row.get("_sanctioned", 0.0)

        if discrepancy >= 40.0:
            return (
                "Progress-Disbursement Divergence",
                f"High divergence: Financial progress ({fin_prog:.1f}%) exceeds physical progress ({phys_prog:.1f}%) by {discrepancy:.1f}%."
            )
        elif exp_sanction_ratio > 1.15:
            overrun_pct = (exp_sanction_ratio - 1.0) * 100.0
            return (
                "Unrevised Cost Variance",
                f"Expenditure (₹{expenditure:.2f}L) exceeds administrative sanction (₹{sanctioned:.2f}L) by {overrun_pct:.1f}%."
            )
        elif expenditure > 10.0 and phys_prog < 10.0:
            return (
                "Stalled Physical Execution",
                f"Significant expenditure (₹{expenditure:.2f}L) booked with minimal physical progress ({phys_prog:.1f}%)."
            )
        elif discrepancy <= -35.0:
            return (
                "Disbursement Lag / Documentation Delay",
                f"Physical progress ({phys_prog:.1f}%) significantly outpaces recorded expenditure ({fin_prog:.1f}%)."
            )
        else:
            return (
                "Statistical Outlier",
                "Project metrics diverge significantly from district/state cluster distribution."
            )

    def detect(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Run end-to-end anomaly detection on the provided DataFrame.

        Returns:
            output_df: Decorated DataFrame with audit flags, scores, and human review notices.
        """
        processed_df, features_df = self.clean_and_prepare_features(df)

        if self.model is None:
            self.fit(features_df)

        # Isolation Forest prediction: 1 = Inlier (Normal), -1 = Outlier (Anomaly)
        preds = self.model.predict(features_df)

        # Raw anomaly score: negative for outliers, positive for inliers
        raw_scores = self.model.decision_function(features_df)

        # Normalize score into a human-friendly [0.0, 1.0] confidence scale
        # where higher value = higher likelihood of being an outlier
        min_s, max_s = raw_scores.min(), raw_scores.max()
        if max_s > min_s:
            # Invert so higher score represents higher anomaly priority
            norm_anomaly_score = 1.0 - ((raw_scores - min_s) / (max_s - min_s))
        else:
            norm_anomaly_score = np.zeros_like(raw_scores)

        # Assemble output columns
        output_df = df.copy()
        output_df["anomaly_score"] = np.round(norm_anomaly_score, 4)
        output_df["is_flagged"] = (preds == -1)
        output_df["anomaly_label"] = np.where(
            preds == -1, "Flagged (Review Required)", "Normal"
        )
        output_df["progress_discrepancy"] = processed_df["progress_discrepancy"]

        categories = []
        explanations = []
        for idx in range(len(output_df)):
            if preds[idx] == -1:
                cat, exp = self.generate_explanation(processed_df.iloc[idx])
            else:
                cat, exp = ("Normal", "Project metrics are within expected statistical variance.")
            categories.append(cat)
            explanations.append(exp)

        output_df["review_category"] = categories
        output_df["review_explanation"] = explanations
        output_df["audit_disclaimer"] = HUMAN_REVIEW_DISCLAIMER

        return output_df

    def process_csv(
        self,
        input_csv_path: str,
        output_csv_path: Optional[str] = None
    ) -> pd.DataFrame:
        """
        Load input CSV, execute detection, print summary, and optionally save output CSV.
        """
        if not os.path.exists(input_csv_path):
            raise FileNotFoundError(f"Input file not found at: {input_csv_path}")

        logger.info(f"Loading input dataset from: {input_csv_path}")
        df = pd.read_csv(input_csv_path)
        logger.info(f"Loaded {len(df)} records. Beginning anomaly detection...")

        results_df = self.detect(df)

        total_records = len(results_df)
        flagged_count = int(results_df["is_flagged"].sum())
        normal_count = total_records - flagged_count

        logger.info("---------------------------------------------------------")
        logger.info("ANOMALY DETECTION SUMMARY:")
        logger.info(f"Total Projects Evaluated : {total_records}")
        logger.info(f"Flagged for Review       : {flagged_count} ({flagged_count / max(total_records, 1) * 100:.1f}%)")
        logger.info(f"Normal Records           : {normal_count}")
        logger.info(f"Human Review Reminder    : {HUMAN_REVIEW_DISCLAIMER}")
        logger.info("---------------------------------------------------------")

        if output_csv_path:
            os.makedirs(os.path.dirname(os.path.abspath(output_csv_path)), exist_ok=True)
            results_df.to_csv(output_csv_path, index=False)
            logger.info(f"Saved audit output CSV to: {output_csv_path}")

        return results_df


def main():
    parser = argparse.ArgumentParser(
        description="MPLADS Isolation Forest Anomaly Detection Module"
    )
    parser.add_argument(
        "--input",
        type=str,
        default="data/sample_projects.csv",
        help="Path to input MPLADS CSV file (default: data/sample_projects.csv)"
    )
    parser.add_argument(
        "--output",
        type=str,
        default="data/flagged_projects.csv",
        help="Path to save flagged output CSV file (default: data/flagged_projects.csv)"
    )
    parser.add_argument(
        "--contamination",
        type=float,
        default=0.15,
        help="Expected outlier contamination rate between 0.0 and 0.5 (default: 0.15)"
    )
    parser.add_argument(
        "--n_estimators",
        type=int,
        default=100,
        help="Number of Isolation Forest trees (default: 100)"
    )
    parser.add_argument(
        "--random_state",
        type=int,
        default=42,
        help="Random state seed for reproducibility (default: 42)"
    )

    args = parser.parse_args()

    detector = MPLADSAnomalyDetector(
        contamination=args.contamination,
        n_estimators=args.n_estimators,
        random_state=args.random_state
    )

    try:
        detector.process_csv(
            input_csv_path=args.input,
            output_csv_path=args.output
        )
    except Exception as e:
        logger.error(f"Error executing anomaly detection: {e}", exc_info=True)
        sys.exit(1)


if __name__ == "__main__":
    main()
