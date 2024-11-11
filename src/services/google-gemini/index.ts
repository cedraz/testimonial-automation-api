export async function GPTMock(data: any) {
  return {
    data: {
      choices: [
        {
          text: 'This is a mock response from GPT-3.',
        },
      ],
    },
  };
}
