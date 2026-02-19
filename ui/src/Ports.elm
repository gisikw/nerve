port module Ports exposing
    ( sendToTauri
    , receiveFromTauri
    , resizeComposeInput
    , onScrollNearTop
    , onScrollNearBottom
    , saveArchivedRooms
    , saveTtsEnabled
    , startRecording
    , stopRecording
    , onRecordingState
    , onImageAttached
    , clearImageAttachment
    , sendImageMessage
    )

import Json.Encode as E


port sendToTauri : E.Value -> Cmd msg


port receiveFromTauri : (E.Value -> msg) -> Sub msg


{-| Signal the JS glue to resize the compose textarea to fit its content.
Called after text changes and after send (to reset height).
-}
port resizeComposeInput : () -> Cmd msg


{-| Fired by JS when the messages container is scrolled near the top.
-}
port onScrollNearTop : (() -> msg) -> Sub msg


{-| Fired by JS when the messages container is scrolled back near the bottom.
-}
port onScrollNearBottom : (() -> msg) -> Sub msg


{-| Persist archived room IDs to localStorage.
-}
port saveArchivedRooms : E.Value -> Cmd msg


{-| Persist TTS enabled state to localStorage.
-}
port saveTtsEnabled : E.Value -> Cmd msg


{-| Tell JS to start recording audio from the microphone.
-}
port startRecording : () -> Cmd msg


{-| Tell JS to stop recording and send the voice message.
-}
port stopRecording : () -> Cmd msg


{-| Fired by JS when recording state changes (true = recording, false = stopped).
-}
port onRecordingState : (Bool -> msg) -> Sub msg


{-| Fired by JS when user pastes/drops an image. Sends a preview data: URL.
-}
port onImageAttached : (String -> msg) -> Sub msg


{-| Tell JS to discard the pending image file.
-}
port clearImageAttachment : () -> Cmd msg


{-| Tell JS to send the pending image with a message body.
-}
port sendImageMessage : E.Value -> Cmd msg
