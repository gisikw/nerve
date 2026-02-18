port module Ports exposing
    ( sendToTauri
    , receiveFromTauri
    , resizeComposeInput
    , onScrollNearTop
    , onScrollNearBottom
    , saveArchivedRooms
    , saveTtsEnabled
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
