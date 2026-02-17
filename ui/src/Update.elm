module Update exposing (update)

import Commands
import Decode
import Json.Decode as D
import Model exposing (Model, Msg(..), Page(..))


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        -- Login form
        SetHomeserver s ->
            let
                form =
                    model.loginForm
            in
            ( { model | loginForm = { form | homeserver = s } }, Cmd.none )

        SetUsername s ->
            let
                form =
                    model.loginForm
            in
            ( { model | loginForm = { form | username = s } }, Cmd.none )

        SetPassword s ->
            let
                form =
                    model.loginForm
            in
            ( { model | loginForm = { form | password = s } }, Cmd.none )

        SubmitLogin ->
            ( { model | loginLoading = True, loginError = Nothing }
            , Commands.login model.loginForm
            )

        -- Rooms
        SelectRoom roomId ->
            ( { model
                | selectedRoomId = Just roomId
                , messages = []
                , messagesLoading = True
              }
            , Commands.getMessages roomId
            )

        -- Compose
        SetComposeText s ->
            ( { model | composeText = s }, Cmd.none )

        SubmitMessage ->
            case model.selectedRoomId of
                Just roomId ->
                    if String.isEmpty (String.trim model.composeText) then
                        ( model, Cmd.none )

                    else
                        ( { model | composeText = "" }
                        , Commands.sendMessage roomId model.composeText
                        )

                Nothing ->
                    ( model, Cmd.none )

        -- Logout
        Logout ->
            ( model, Commands.logout )

        -- Polling
        PollRooms ->
            ( model, Commands.listRooms )

        PollMessages ->
            case model.selectedRoomId of
                Just roomId ->
                    ( model, Commands.getMessages roomId )

                Nothing ->
                    ( model, Cmd.none )

        -- Port responses
        ReceivedFromTauri value ->
            handlePortResponse value model


handlePortResponse : D.Value -> Model -> ( Model, Cmd Msg )
handlePortResponse value model =
    case D.decodeValue tagDecoder value of
        Ok ( tag, payload ) ->
            dispatchTag tag payload model

        Err err ->
            ( model, Cmd.none )


tagDecoder : D.Decoder ( String, D.Value )
tagDecoder =
    D.map2 Tuple.pair
        (D.field "tag" D.string)
        (D.field "payload" D.value)


dispatchTag : String -> D.Value -> Model -> ( Model, Cmd Msg )
dispatchTag tag payload model =
    case tag of
        "checkSession" ->
            case D.decodeValue Decode.sessionStatus payload of
                Ok status ->
                    if status.loggedIn then
                        ( { model
                            | page = MainPage
                            , userId = status.userId
                          }
                        , Commands.listRooms
                        )

                    else
                        ( { model | page = LoginPage }, Cmd.none )

                Err _ ->
                    ( { model | page = LoginPage }, Cmd.none )

        "login" ->
            case D.decodeValue Decode.loginResult payload of
                Ok result ->
                    ( { model
                        | page = MainPage
                        , userId = Just result.userId
                        , loginLoading = False
                        , loginError = Nothing
                        , loginForm = { homeserver = model.loginForm.homeserver, username = "", password = "" }
                      }
                    , Commands.listRooms
                    )

                Err _ ->
                    ( { model
                        | loginLoading = False
                        , loginError = Just "Login failed"
                      }
                    , Cmd.none
                    )

        "logout" ->
            ( { model
                | page = LoginPage
                , userId = Nothing
                , rooms = []
                , selectedRoomId = Nothing
                , messages = []
              }
            , Cmd.none
            )

        "listRooms" ->
            case D.decodeValue Decode.roomList payload of
                Ok rooms ->
                    ( { model | rooms = rooms }, Cmd.none )

                Err _ ->
                    ( model, Cmd.none )

        "getMessages" ->
            case D.decodeValue Decode.messageList payload of
                Ok messages ->
                    ( { model | messages = messages, messagesLoading = False }
                    , Cmd.none
                    )

                Err _ ->
                    ( { model | messagesLoading = False }, Cmd.none )

        "sendMessage" ->
            -- After sending, refresh messages
            case model.selectedRoomId of
                Just roomId ->
                    ( model, Commands.getMessages roomId )

                Nothing ->
                    ( model, Cmd.none )

        "error" ->
            case D.decodeValue D.string payload of
                Ok errMsg ->
                    if model.loginLoading then
                        ( { model | loginLoading = False, loginError = Just errMsg }
                        , Cmd.none
                        )

                    else
                        ( model, Cmd.none )

                Err _ ->
                    ( model, Cmd.none )

        _ ->
            ( model, Cmd.none )
