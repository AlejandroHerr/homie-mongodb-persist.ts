// eslint-disable-next-line import/prefer-default-export
export type OnTopicMessageCallback = (
  topic: string,
  message: Buffer,
  params: Record<string, string | string[]>,
) => void;
