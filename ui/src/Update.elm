module Update exposing (filteredRooms, update)

import Browser.Dom
import Commands
import Decode
import Dict
import Json.Decode as D
import Model exposing (Model, Msg(..), Page(..))
import Ports
import Task
import Types exposing (Room)


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
            let
                -- Save current compose text as draft for the old room
                updatedDrafts =
                    case model.selectedRoomId of
                        Just oldRoomId ->
                            if String.isEmpty (String.trim model.composeText) then
                                Dict.remove oldRoomId model.drafts

                            else
                                Dict.insert oldRoomId model.composeText model.drafts

                        Nothing ->
                            model.drafts

                -- Restore draft for the new room
                restoredText =
                    Dict.get roomId updatedDrafts |> Maybe.withDefault ""
            in
            ( { model
                | selectedRoomId = Just roomId
                , messages = []
                , messagesLoading = True
                , loadingOlder = False
                , switcherOpen = False
                , typingUsers = []
                , composeText = restoredText
                , drafts = updatedDrafts
                , paginationToken = Nothing
                , hasOlderHistory = False
                , rooms =
                    List.map
                        (\r ->
                            if r.id == roomId then
                                { r | notificationCount = 0 }

                            else
                                r
                        )
                        model.rooms
              }
            , Cmd.batch
                [ Commands.getMessages roomId
                , focusCompose
                , scrollToBottomForce
                ]
            )

        -- Compose
        SetComposeText s ->
            let
                typingCmd =
                    case model.selectedRoomId of
                        Just roomId ->
                            if not (String.isEmpty s) then
                                Commands.sendTypingNotice roomId True

                            else
                                Commands.sendTypingNotice roomId False

                        Nothing ->
                            Cmd.none
            in
            ( { model | composeText = s }
            , Cmd.batch [ Ports.resizeComposeInput (), typingCmd ]
            )

        SubmitMessage ->
            case model.selectedRoomId of
                Just roomId ->
                    if String.isEmpty (String.trim model.composeText) then
                        ( model, Cmd.none )

                    else
                        ( { model | composeText = "" }
                        , Cmd.batch
                            [ Commands.sendMessage roomId model.composeText
                            , Commands.sendTypingNotice roomId False
                            , Ports.resizeComposeInput ()
                            ]
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
            -- Skip polling while viewing older paginated history to avoid
            -- blowing away prepended messages
            if model.hasOlderHistory then
                ( model, Cmd.none )

            else
                case model.selectedRoomId of
                    Just roomId ->
                        ( model, Commands.getMessages roomId )

                    Nothing ->
                        ( model, Cmd.none )

        -- DOM effects (fire-and-forget results)
        DomNoOp ->
            ( model, Cmd.none )

        -- Reactions
        SendReaction eventId emoji ->
            case model.selectedRoomId of
                Just roomId ->
                    ( model, Commands.sendReaction roomId eventId emoji )

                Nothing ->
                    ( model, Cmd.none )

        -- Keyboard: printable key pressed while compose not focused
        KeyPressed _ ->
            if model.switcherOpen || model.shortcutsOpen then
                ( model, Cmd.none )

            else
                ( model, focusCompose )

        -- Shortcuts modal
        OpenShortcuts ->
            ( { model | shortcutsOpen = True }, Cmd.none )

        CloseShortcuts ->
            ( { model | shortcutsOpen = False }, Cmd.none )

        -- Channel switcher
        OpenSwitcher ->
            ( { model | switcherOpen = True, switcherQuery = "", switcherIndex = 0 }
            , focusElement "switcher-input"
            )

        CloseSwitcher ->
            ( { model | switcherOpen = False }, Cmd.none )

        SetSwitcherQuery q ->
            ( { model | switcherQuery = q, switcherIndex = 0 }, Cmd.none )

        SwitcherUp ->
            ( { model | switcherIndex = max 0 (model.switcherIndex - 1) }, Cmd.none )

        SwitcherDown ->
            let
                maxIdx =
                    max 0 (List.length (filteredRooms model) - 1)
            in
            ( { model | switcherIndex = min maxIdx (model.switcherIndex + 1) }, Cmd.none )

        SwitcherSelect ->
            let
                rooms =
                    filteredRooms model

                selected =
                    List.drop model.switcherIndex rooms |> List.head
            in
            case selected of
                Just room ->
                    update (SelectRoom room.id)
                        { model | switcherOpen = False }

                Nothing ->
                    if String.isEmpty (String.trim model.switcherQuery) then
                        ( { model | switcherOpen = False }, Cmd.none )

                    else
                        ( { model | switcherOpen = False }
                        , Commands.createRoom (String.trim model.switcherQuery)
                        )

        -- Typing
        PollTyping ->
            case model.selectedRoomId of
                Just roomId ->
                    ( model, Commands.getTyping roomId )

                Nothing ->
                    ( model, Cmd.none )

        SendTypingNotice isTyping ->
            case model.selectedRoomId of
                Just roomId ->
                    ( model, Commands.sendTypingNotice roomId isTyping )

                Nothing ->
                    ( model, Cmd.none )

        -- Pagination
        LoadOlderMessages ->
            case ( model.selectedRoomId, model.paginationToken, model.loadingOlder ) of
                ( Just roomId, Just token, False ) ->
                    ( { model | loadingOlder = True }
                    , Commands.getOlderMessages roomId token
                    )

                _ ->
                    ( model, Cmd.none )

        ResumePolling ->
            if model.hasOlderHistory then
                case model.selectedRoomId of
                    Just roomId ->
                        ( { model | hasOlderHistory = False }
                        , Commands.getMessages roomId
                        )

                    Nothing ->
                        ( { model | hasOlderHistory = False }, Cmd.none )

            else
                ( model, Cmd.none )

        -- Time zone
        GotTimeZone zone ->
            ( { model | timeZone = zone }, Cmd.none )

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
                    let
                        -- Clear unread count for the currently viewed room
                        clearActiveUnread r =
                            case model.selectedRoomId of
                                Just rid ->
                                    if r.id == rid then
                                        { r | notificationCount = 0 }

                                    else
                                        r

                                Nothing ->
                                    r

                        updatedRooms =
                            List.map clearActiveUnread rooms

                        typingUsers =
                            model.selectedRoomId
                                |> Maybe.andThen (\rid -> List.filter (\r -> r.id == rid) updatedRooms |> List.head)
                                |> Maybe.map .typingUsers
                                |> Maybe.withDefault []
                    in
                    ( { model | rooms = updatedRooms, typingUsers = typingUsers }, Cmd.none )

                Err _ ->
                    ( model, Cmd.none )

        "getMessages" ->
            case D.decodeValue Decode.messagesResponse payload of
                Ok resp ->
                    ( { model
                        | messages = resp.messages
                        , messagesLoading = False
                        , paginationToken = resp.endToken
                      }
                    , scrollToBottom
                    )

                Err _ ->
                    ( { model | messagesLoading = False }, Cmd.none )

        "getOlderMessages" ->
            case D.decodeValue Decode.messagesResponse payload of
                Ok resp ->
                    ( { model
                        | messages = resp.messages ++ model.messages
                        , loadingOlder = False
                        , paginationToken = resp.endToken
                        , hasOlderHistory = True
                      }
                    , Cmd.none
                    )

                Err _ ->
                    ( { model | loadingOlder = False }, Cmd.none )

        "sendMessage" ->
            -- After sending, refresh messages
            case model.selectedRoomId of
                Just roomId ->
                    ( model, Commands.getMessages roomId )

                Nothing ->
                    ( model, Cmd.none )

        "createRoom" ->
            case D.decodeValue Decode.createRoomResult payload of
                Ok result ->
                    -- Refresh rooms list, then select the new room
                    ( model
                    , Cmd.batch
                        [ Commands.listRooms
                        , Task.perform (\_ -> SelectRoom result.roomId) (Task.succeed ())
                        ]
                    )

                Err _ ->
                    ( model, Cmd.none )

        "sendReaction" ->
            -- After reacting, refresh messages to show updated reactions
            case model.selectedRoomId of
                Just roomId ->
                    ( model, Commands.getMessages roomId )

                Nothing ->
                    ( model, Cmd.none )

        "getTyping" ->
            case D.decodeValue Decode.typingStatus payload of
                Ok status ->
                    ( { model | typingUsers = status.users }, Cmd.none )

                Err _ ->
                    ( model, Cmd.none )

        "sendTypingNotice" ->
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


focusElement : String -> Cmd Msg
focusElement elementId =
    Browser.Dom.focus elementId
        |> Task.attempt (\_ -> DomNoOp)


focusCompose : Cmd Msg
focusCompose =
    focusElement "compose-input"


filteredRooms : Model -> List Room
filteredRooms model =
    let
        q =
            String.toLower model.switcherQuery
    in
    if String.isEmpty q then
        model.rooms

    else
        List.filter (\r -> String.contains q (String.toLower r.name)) model.rooms


{-| Scroll the messages container to the bottom, but only if already near
the bottom (within 100px). This preserves scroll-back position when reading
history while still auto-scrolling during active conversation.
-}
scrollToBottom : Cmd Msg
scrollToBottom =
    Browser.Dom.getViewportOf "messages"
        |> Task.andThen
            (\viewport ->
                let
                    nearBottom =
                        viewport.viewport.y
                            + viewport.viewport.height
                            >= viewport.scene.height
                            - 100
                in
                if nearBottom then
                    Browser.Dom.setViewportOf "messages" 0 viewport.scene.height

                else
                    Task.succeed ()
            )
        |> Task.attempt (\_ -> DomNoOp)


{-| Unconditionally scroll the messages container to the bottom.
Used when switching rooms where we always want to land at the latest messages.
-}
scrollToBottomForce : Cmd Msg
scrollToBottomForce =
    Browser.Dom.getViewportOf "messages"
        |> Task.andThen
            (\viewport ->
                Browser.Dom.setViewportOf "messages" 0 viewport.scene.height
            )
        |> Task.attempt (\_ -> DomNoOp)
