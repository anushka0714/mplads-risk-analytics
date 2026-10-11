"""
Unit Tests for MPLADS Anomaly Detection Module
----------------------------------------------
Tests column mapping, missing value handling, zero division safety,
Isolation Forest scoring, and output generation.
"""

import unittest
import pandas as pd
import numpy as np
import tempfile
import os

from ml.anomaly_detector import MPLADSAnomalyDetector, HUMAN_REVIEW_DISCLAIMER


class TestMPLADSAnomalyDetector(unittest.TestCase):

    def setUp(self):
        self.detector = MPLADSAnomalyDetector(
            contamination=0.2,
            n_estimators=50,
            random_state=42
        )

    def test_flexible_column_mapping(self):
        """Test that different naming conventions for columns are correctly mapped."""
        df = pd.DataFrame({
            "code": ["MP-01", "MP-02"],
            "sanctionAmountLakhs": [50.0, 40.0],
            "releasedAmountLakhs": [40.0, 30.0],
            "expenditureLakhs": [30.0, 25.0],
            "physicalProgress": [70.0, 60.0]
        })
        col_map = self.detector.resolve_columns(df)
        self.assertEqual(col_map["project_id"], "code")
        self.assertEqual(col_map["sanctioned_amount"], "sanctionAmountLakhs")
        self.assertEqual(col_map["released_amount"], "releasedAmountLakhs")
        self.assertEqual(col_map["expenditure_amount"], "expenditureLakhs")
        self.assertEqual(col_map["physical_progress"], "physicalProgress")

    def test_missing_values_and_invalid_data(self):
        """Ensure invalid numerical inputs (strings, None, NaNs) are safely sanitized."""
        df = pd.DataFrame({
            "project_id": ["P1", "P2", "P3"],
            "sanctioned_amount": [50.0, None, "INVALID_STR"],
            "released_amount": [40.0, 20.0, None],
            "expenditure_amount": [35.0, 18.0, 0.0],
            "physical_progress": [80.0, None, 50.0]
        })

        processed, features = self.detector.clean_and_prepare_features(df)
        # Verify no NaN or Inf in feature matrix
        self.assertFalse(features.isna().any().any())
        self.assertFalse(np.isinf(features.to_numpy()).any())
        self.assertEqual(len(features), 3)

    def test_zero_division_safety(self):
        """Test that zero sanction or zero release does not cause division by zero errors."""
        df = pd.DataFrame({
            "project_id": ["P-ZERO-1", "P-ZERO-2"],
            "sanctioned_amount": [0.0, 10.0],
            "released_amount": [0.0, 0.0],
            "expenditure_amount": [0.0, 5.0],
            "physical_progress": [0.0, 10.0]
        })

        processed, features = self.detector.clean_and_prepare_features(df)
        self.assertFalse(features.isna().any().any())
        self.assertFalse(np.isinf(features.to_numpy()).any())

    def test_detection_and_score_bounds(self):
        """Test anomaly scores and flags on sample data."""
        df = pd.DataFrame({
            "project_id": [f"PRJ-{i}" for i in range(10)],
            "sanctioned_amount": [50.0, 48.0, 20.0, 35.0, 30.0, 25.0, 40.0, 15.0, 60.0, 22.0],
            "released_amount":   [40.0, 45.0, 15.0, 35.0, 28.0, 25.0, 35.0, 15.0, 55.0, 20.0],
            "expenditure_amount":[35.0, 44.0, 10.0, 45.0, 27.0, 24.0, 32.0, 14.0, 52.0, 12.0],
            # P1 has 91% spend with 10% progress (clear outlier)
            "physical_progress": [70.0, 10.0, 50.0, 90.0, 85.0, 95.0, 80.0, 100.0, 20.0, 55.0]
        })

        results = self.detector.detect(df)
        self.assertIn("anomaly_score", results.columns)
        self.assertIn("is_flagged", results.columns)
        self.assertIn("anomaly_label", results.columns)
        self.assertIn("review_explanation", results.columns)
        self.assertIn("audit_disclaimer", results.columns)

        # Check score boundaries
        self.assertTrue((results["anomaly_score"] >= 0.0).all())
        self.assertTrue((results["anomaly_score"] <= 1.0).all())

        # Ensure disclaimer matches exactly
        for disc in results["audit_disclaimer"]:
            self.assertEqual(disc, HUMAN_REVIEW_DISCLAIMER)

    def test_process_csv_end_to_end(self):
        """Test end-to-end reading, processing, and writing a CSV."""
        sample_data = """project_id,sanctioned_amount,released_amount,expenditure_amount,physical_progress
PRJ-01,50.0,40.0,34.0,68.0
PRJ-02,48.5,46.0,44.6,24.0
PRJ-03,22.0,18.0,11.0,35.0
PRJ-04,35.0,35.0,45.3,88.0
PRJ-05,32.5,32.5,31.8,100.0
"""
        with tempfile.NamedTemporaryFile("w+", delete=False, suffix=".csv") as in_f:
            in_f.write(sample_data)
            in_path = in_f.name

        out_path = in_path.replace(".csv", "_out.csv")

        try:
            results = self.detector.process_csv(in_path, out_path)
            self.assertTrue(os.path.exists(out_path))
            out_df = pd.read_csv(out_path)
            self.assertEqual(len(out_df), 5)
            self.assertIn("anomaly_score", out_df.columns)
            self.assertIn("audit_disclaimer", out_df.columns)
        finally:
            if os.path.exists(in_path):
                os.remove(in_path)
            if os.path.exists(out_path):
                os.remove(out_path)


if __name__ == "__main__":
    unittest.main()
