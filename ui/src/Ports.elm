port module Ports exposing
    ( sendToTauri
    , receiveFromTauri
    , resizeComposeInput
    )

import Json.Encode as E


port sendToTauri : E.Value -> Cmd msg


port receiveFromTauri : (E.Value -> msg) -> Sub msg


{-| Signal the JS glue to resize the compose textarea to fit its content.
Called after text changes and after send (to reset height).
-}
port resizeComposeInput : () -> Cmd msg
