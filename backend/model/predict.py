"""
Loads YOLO weights from `backend/best.pt` (or `backend/model/best.pt`).
Requires `ultralytics` (uv add ultralytics).

If no weights are found, predict() just returns the original image with no detections.
"""

from pathlib import Path

from PIL import Image

_CANDIDATES = [
    Path(__file__).parent.parent / "best.pt",  # backend/best.pt
    Path(__file__).parent / "best.pt",  # backend/model/best.pt
]
WEIGHTS = next((p for p in _CANDIDATES if p.exists()), _CANDIDATES[0])

_model = None


def _load_model():
    global _model
    if _model is None and WEIGHTS.exists():
        from ultralytics import YOLO

        _model = YOLO(str(WEIGHTS))
    return _model


def predict(image: Image.Image):
    """Returns (annotated PIL image, list of detections)."""
    model = _load_model()
    if model is None:
        return image, []

    result = model(image)[0]

    # result.plot() gives a BGR numpy array -> convert to RGB PIL image
    annotated = Image.fromarray(result.plot()[..., ::-1])

    detections = [
        {
            "label": result.names[int(box.cls)],
            "confidence": round(float(box.conf), 3),
            "box": [round(v, 1) for v in box.xyxy[0].tolist()],
        }
        for box in result.boxes
    ]
    return annotated, detections
