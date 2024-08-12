let vscodeApi: VsCodeApi | undefined;

export const getVsCodeApi = (): VsCodeApi => {
  if (!vscodeApi) {
    vscodeApi = acquireVsCodeApi();
  }
  return vscodeApi;
};
