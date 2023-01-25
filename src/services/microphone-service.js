export const fetchWebsocketUrl = async () => {
  //Fetch temporary JWT Token and make call to Voicegain API to get websocket URLs
  let websocketSendUrl, websocketReceiveUrl, stompClient, jwtToken, websocket;
  const websocketApiUrl = new URL(
    "https://api.voicegain.ai/v1/asr/recognize/async"
  );

  //Configuring the request body to the API
  let request = {
    sessions: [
      {
        asyncMode: "REAL-TIME",
        websocket: { adHoc: true, minimumDelay: 0, useSTOMP: false },
        continuousRecognition: {
          enable: true,
          stopOn: ["ERROR"],
          noResponseFor: ["INPUT-STARTED", "NOINPUT"],
        },
      },
    ],
    audio: {
      source: { stream: { protocol: "WEBSOCKET" } },
      format: "F32",
      rate: 16000,
      channels: "mono",
      capture: true,
    },
    settings: {
      asr: {
        confidenceThreshold: 0.175,
        noInputTimeout: 9000,
        incompleteTimeout: 2500,
        completeTimeout: 100,
        sensitivity: 0.1,
        grammars: [
          {
            type: "JJSGF",
            parameters: { "tag-format": "semantics/1.0-literals" },
            grammar: "command",
            public: {
              root: "<first> {first} | <second> {second} | <third> {third} | <fourth> {fourth} | <fifth> {fifth} | <sixth> {sixth}",
            },
            rules: {
              first: "( left )",
              second: "( right )",
              third: "( up )",
              fourth: "( down )",
              fifth: "( go )",
              sixth: "( stop )",
            },
          },
        ],
      },
    },
  };

  const bearer =
    "Bearer " +
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJhZWRmYjEwNC1mMmU3LTRjNjQtOWJlOC03MDE1NTdiYTAzMDIiLCJhdWQiOiJodHRwczovL2FwaS52b2ljZWdhaW4uYWkvdjEiLCJzdWIiOiI1YzRmYjI4Zi1hZjRlLTQwYWItYmZmOS1jZWUwM2QxYzY2MTkifQ.6fzpSOPlAukU2TlU4HW0jnGx5Sik1kEV2DdXXw0_ja4";

  const body = JSON.stringify(request);

  const options = {
    body,
    method: "POST",
    headers: {
      Authorization: bearer,
      "Content-Type": "application/json",
    },
  };

  try {
    let fetchWebsocketResponse = await fetch(
      websocketApiUrl.toString(),
      options
    );

    if (fetchWebsocketResponse.ok) {
      let fetchWebsocketData = await fetchWebsocketResponse.json();
      websocketSendUrl = fetchWebsocketData.audio.stream.websocketUrl; //streams audio to the recognizer
      websocketReceiveUrl = fetchWebsocketData.sessions[0].websocket.url; //receives results

      return {
        websocketSendUrl,
        websocketReceiveUrl,
      };
      //   startMicrophoneCapture(websocketSendUrl, websocketReceiveUrl);
    }
  } catch (err) {
    window.alert("Unable to start capture.");
    console.log(err.message);
  } finally {
  }
};
