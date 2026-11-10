import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, "../.env") })
dotenv.config({ path: path.resolve(__dirname, "../../../.env") })
dotenv.config()
import { cert, initializeApp } from "firebase-admin";

const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID || "cortexai-95209",
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID || "0fcdc0540cc0a407bbc963829e147c93565fc8af",
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL || "firebase-adminsdk-fbsvc@cortexai-95209.iam.gserviceaccount.com",
  client_id: process.env.FIREBASE_CLIENT_ID || "116605897065415341541",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL || "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40cortexai-95209.iam.gserviceaccount.com",
};

export const app = initializeApp({
  credential: cert(serviceAccount)
});
