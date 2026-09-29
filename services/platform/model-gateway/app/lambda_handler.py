"""Future AWS Lambda handler entrypoint — not used in local development."""

from mangum import Mangum

from app.main import app

handler = Mangum(app)
