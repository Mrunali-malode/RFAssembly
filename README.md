# RF Assembly Detector

Upload an image → FastAPI backend runs YOLO → annotated image comes back.

## Run it

**Backend** (terminal 1)
```bash
cd backend
uv sync
uv run uvicorn main:app --reload
```

**Frontend** (terminal 2)
```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000

## Adding the model
1. Put your weights at `backend/model/best.pt`
2. `cd backend && uv add ultralytics`
3. Restart the backend — that's it.
