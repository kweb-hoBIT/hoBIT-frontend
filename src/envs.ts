export const envs: HobitEnv = {
  HOBIT_BACKEND_ENDPOINT: process.env.REACT_APP_HOBIT_BACKEND_ENDPOINT,
};

interface HobitEnv {
  HOBIT_BACKEND_ENDPOINT: string | undefined;
}
