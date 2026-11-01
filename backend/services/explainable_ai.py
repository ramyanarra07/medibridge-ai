"""
Medi Bridge AI - Explainable AI (XAI) Engine
Translates model weights, individual feature values, and clinical reference deviations
into interpretable feature contributions and patient-friendly explanations.
"""

CLINICAL_REFERENCE_RANGES = {
    'glucose': {'normal_min': 70, 'normal_max': 99, 'unit': 'mg/dL', 'name': 'Fasting Blood Glucose'},
    'hba1c': {'normal_min': 4.0, 'normal_max': 5.6, 'unit': '%', 'name': 'Hemoglobin A1c'},
    'bmi': {'normal_min': 18.5, 'normal_max': 24.9, 'unit': 'kg/m²', 'name': 'Body Mass Index (BMI)'},
    'systolic_bp': {'normal_min': 90, 'normal_max': 120, 'unit': 'mmHg', 'name': 'Systolic Blood Pressure'},
    'diastolic_bp': {'normal_min': 60, 'normal_max': 80, 'unit': 'mmHg', 'name': 'Diastolic Blood Pressure'},
    'heart_rate': {'normal_min': 60, 'normal_max': 100, 'unit': 'bpm', 'name': 'Resting Heart Rate'},
    'serum_creatinine': {'normal_min': 0.6, 'normal_max': 1.2, 'unit': 'mg/dL', 'name': 'Serum Creatinine'},
    'blood_urea': {'normal_min': 7, 'normal_max': 20, 'unit': 'mg/dL', 'name': 'Blood Urea Nitrogen'},
    'egfr': {'normal_min': 90, 'normal_max': 130, 'unit': 'mL/min/1.73m²', 'name': 'Estimated GFR'},
    'hemoglobin': {'normal_min': 13.0, 'normal_max': 17.5, 'unit': 'g/dL', 'name': 'Hemoglobin'},
    'albumin': {'normal_min': 3.5, 'normal_max': 5.0, 'unit': 'g/dL', 'name': 'Serum Albumin'},
    'total_cholesterol': {'normal_min': 125, 'normal_max': 200, 'unit': 'mg/dL', 'name': 'Total Cholesterol'},
    'exercise_induced_angina': {'normal_min': 0, 'normal_max': 0, 'unit': 'flag', 'name': 'Exertional Chest Pain'}
}

def explain_prediction(condition_type, input_values, model_importances, risk_score):
    """
    Computes local feature contribution weights and plain-English explanations.
    """
    contributions = []
    explanations = []

    # Calculate raw impact based on model feature importance * deviation from normal reference
    raw_impacts = {}
    total_impact = 0.0

    for feat, importance in model_importances.items():
        val = input_values.get(feat)
        if val is None:
            continue

        ref = CLINICAL_REFERENCE_RANGES.get(feat, {'normal_min': 0, 'normal_max': 100, 'unit': '', 'name': feat})
        val = float(val)

        # Deviation factor
        dev = 0.0
        if feat == 'egfr' or feat == 'hemoglobin' or feat == 'albumin':
            # Inverted metrics: lower than normal indicates higher pathology
            if val < ref['normal_min']:
                dev = (ref['normal_min'] - val) / max(ref['normal_min'], 1)
        elif feat == 'exercise_induced_angina':
            dev = 1.0 if val > 0 else 0.0
        else:
            if val > ref['normal_max']:
                dev = (val - ref['normal_max']) / max(ref['normal_max'], 1)

        # Non-linear impact
        impact = importance * (1.0 + 2.0 * dev)
        raw_impacts[feat] = impact
        total_impact += impact

    if total_impact == 0:
        total_impact = 1.0

    # Normalize contributions to percentages
    sorted_feats = sorted(raw_impacts.items(), key=lambda x: x[1], reverse=True)

    for feat, impact in sorted_feats[:5]:
        percentage = round((impact / total_impact) * 100, 1)
        val = input_values.get(feat)
        ref = CLINICAL_REFERENCE_RANGES.get(feat, {'normal_min': 0, 'normal_max': 100, 'unit': '', 'name': feat})

        # Directional status
        status = "Normal range"
        direction = "neutral"
        if feat in ['egfr', 'hemoglobin', 'albumin']:
            if val < ref['normal_min']:
                status = f"Below optimal ({val} vs >={ref['normal_min']} {ref['unit']})"
                direction = "negative"
        elif feat == 'exercise_induced_angina':
            if val > 0:
                status = "Present (Exertional discomfort)"
                direction = "negative"
        else:
            if val > ref['normal_max']:
                status = f"Elevated ({val} vs <={ref['normal_max']} {ref['unit']})"
                direction = "negative"

        contributions.append({
            'feature': feat,
            'label': ref['name'],
            'value': val,
            'unit': ref['unit'],
            'contribution_pct': percentage,
            'status': status,
            'direction': direction
        })

    # Generate patient-comprehensible synthesis
    if condition_type == 'diabetes':
        glu = input_values.get('glucose', 100)
        hba1c = input_values.get('hba1c', 5.5)
        bmi = input_values.get('bmi', 24)
        if risk_score > 0.65:
            summary = (
                f"Your estimated glycemic risk is elevated at {round(risk_score * 100, 1)}%. "
                f"The key primary driver is fasting blood glucose ({glu} mg/dL) and HbA1c ({hba1c}%), "
                f"which exceed standard target ranges. BMI of {bmi} kg/m² also places moderate metabolic demand."
            )
        elif risk_score > 0.35:
            summary = (
                f"Moderate risk indicator ({round(risk_score * 100, 1)}%). Fasting glucose ({glu} mg/dL) is in the borderline zone. "
                f"Regular monitoring and lifestyle changes can prevent further progression."
            )
        else:
            summary = (
                f"Low risk profile ({round(risk_score * 100, 1)}%). Glycemic and metabolic markers are well within standard reference intervals."
            )

    elif condition_type == 'ckd':
        cr = input_values.get('serum_creatinine', 1.0)
        egfr = input_values.get('egfr', 90)
        urea = input_values.get('blood_urea', 20)
        if risk_score > 0.65:
            summary = (
                f"Renal filtration risk score is {round(risk_score * 100, 1)}% (High Attention). "
                f"Serum Creatinine ({cr} mg/dL) and reduced eGFR ({egfr} mL/min) contribute most to this prediction. "
                f"Doctor review is recommended for renal preservation."
            )
        elif risk_score > 0.35:
            summary = (
                f"Mild-to-moderate renal marker fluctuation ({round(risk_score * 100, 1)}%). Urea ({urea} mg/dL) and creatinine ({cr} mg/dL) indicate mild reduction in glomerular filtration efficiency."
            )
        else:
            summary = (
                f"Normal renal filtration function ({round(risk_score * 100, 1)}%). Creatinine ({cr} mg/dL) and eGFR ({egfr} mL/min) reflect healthy kidney clearance."
            )

    elif condition_type == 'hypertension':
        sbp = input_values.get('systolic_bp', 120)
        dbp = input_values.get('diastolic_bp', 80)
        if risk_score > 0.65:
            summary = (
                f"High arterial pressure risk ({round(risk_score * 100, 1)}%). Systolic BP ({sbp} mmHg) and Diastolic BP ({dbp} mmHg) meet Stage 2 hypertension criteria. Prompt medical titration is advised."
            )
        elif risk_score > 0.35:
            summary = (
                f"Borderline / Stage 1 pressure indicator ({round(risk_score * 100, 1)}%). Systolic BP of {sbp} mmHg shows vascular resistance above optimal rest baseline."
            )
        else:
            summary = (
                f"Normotensive risk ({round(risk_score * 100, 1)}%). Resting blood pressure ({sbp}/{dbp} mmHg) is comfortably within the healthy physiological target."
            )

    else: # cardiovascular
        chol = input_values.get('total_cholesterol', 180)
        sbp = input_values.get('systolic_bp', 120)
        angina = input_values.get('exercise_induced_angina', 0)
        if risk_score > 0.65:
            summary = (
                f"Cardiovascular vulnerability is flagged as High ({round(risk_score * 100, 1)}%). "
                f"Total Cholesterol ({chol} mg/dL) coupled with systolic load ({sbp} mmHg) and exertional angina flags "
                f"are primary contributors. Immediate clinical consultation advised."
            )
        elif risk_score > 0.35:
            summary = (
                f"Moderate cardiovascular risk ({round(risk_score * 100, 1)}%). Cholesterol ({chol} mg/dL) is borderline elevated. Regular aerobic activity and dietary lipid control recommended."
            )
        else:
            summary = (
                f"Favorable cardiovascular profile ({round(risk_score * 100, 1)}%). Lipid and hemodynamic parameters remain well controlled."
            )

    return contributions, summary
