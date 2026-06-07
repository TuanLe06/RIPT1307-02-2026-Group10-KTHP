export const ekycConfig = {
  fptApiKey: process.env.FPT_API_KEY || process.env.FPT_EKYC_API_KEY || '',
  idrEndpoint: process.env.FPT_IDR_ENDPOINT || 'https://api.fpt.ai/vision/idr/vnm/',
  faceEndpoint: process.env.FPT_FACE_MATCH_ENDPOINT || 'https://api.fpt.ai/dmp/checkface/v1/',
  timeoutMs: Number(process.env.FPT_EKYC_TIMEOUT_MS || 15000),
  similarityThreshold: Number(process.env.EKYC_FACE_SIMILARITY_THRESHOLD || 80),
};
