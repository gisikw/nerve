module Model exposing
    ( Model
    , Page(..)
    , Msg(..)
    , initialModel
    )

import Dict exposing (Dict)
import Json.Encode as E
import Set exposing (Set)
import Time
import Types exposing (..)


type Page
    = LoginPage
    | MainPage


type alias Model =
    { page : Page
    , userId : Maybe String
    , loginForm : LoginForm
    , loginError : Maybe String
    , loginLoading : Bool
    , rooms : List Room
    , selectedRoomId : Maybe String
    , messages : List Message
    , messagesLoading : Bool
    , loadingOlder : Bool
    , composeText : String
    , drafts : Dict String String
    , timeZone : Time.Zone
    , shortcutsOpen : Bool
    , switcherOpen : Bool
    , switcherQuery : String
    , switcherIndex : Int
    , typingUsers : List String
    , paginationToken : Maybe String
    , hasOlderHistory : Bool
    , archivedRoomIds : Set String
    , showArchived : Bool
    , pinnedEventIds : Set String
    , showPinned : Bool
    , streams : List StreamState
    , streamsPanelOpen : Bool
    , streamsCollapsed : Set String
    , ttsEnabled : Bool
    , lastMessageId : Maybe String
    , recording : Bool
    , pendingImage : Maybe String
    }


type Msg
    = -- Login form
      SetHomeserver String
    | SetUsername String
    | SetPassword String
    | SubmitLogin
      -- Rooms
    | SelectRoom String
      -- Compose
    | SetComposeText String
    | SubmitMessage
      -- Logout
    | Logout
      -- Port responses (tagged JSON from JS glue)
    | ReceivedFromTauri E.Value
      -- Polling ticks
    | PollRooms
    | PollMessages
      -- DOM effects (fire-and-forget results)
    | DomNoOp
      -- Keyboard
    | KeyPressed String
      -- Reactions
    | SendReaction String String -- eventId emoji
      -- Shortcuts modal
    | OpenShortcuts
    | CloseShortcuts
      -- Channel switcher
    | OpenSwitcher
    | CloseSwitcher
    | SetSwitcherQuery String
    | SwitcherUp
    | SwitcherDown
    | SwitcherSelect
      -- Time zone
    | GotTimeZone Time.Zone
      -- Typing
    | PollTyping
    | SendTypingNotice Bool
      -- Pagination
    | LoadOlderMessages
    | ResumePolling
      -- Room archiving
    | ArchiveRoom String
    | UnarchiveRoom String
    | ToggleArchived
      -- Pinned messages
    | PinMessage String -- eventId
    | UnpinMessage String -- eventId
    | TogglePinned
      -- Streams panel
    | ToggleStreamsPanel
    | PollStreams
    | ToggleStreamCollapsed String -- streamId
    | StreamButtonClick String String -- streamId buttonId
      -- Text-to-speech
    | ToggleTTS
    | SpeakMessage String -- message body
      -- Voice recording
    | ToggleRecording
    | RecordingStateChanged Bool
      -- Image attachment
    | ImageAttached String
    | ClearAttachment


initialModel : Model
initialModel =
    { page = LoginPage
    , userId = Nothing
    , loginForm = { homeserver = "", username = "", password = "" }
    , loginError = Nothing
    , loginLoading = False
    , rooms = []
    , selectedRoomId = Nothing
    , messages = []
    , messagesLoading = False
    , loadingOlder = False
    , composeText = ""
    , drafts = Dict.empty
    , timeZone = Time.utc
    , shortcutsOpen = False
    , switcherOpen = False
    , switcherQuery = ""
    , switcherIndex = 0
    , typingUsers = []
    , paginationToken = Nothing
    , hasOlderHistory = False
    , archivedRoomIds = Set.empty
    , showArchived = False
    , pinnedEventIds = Set.empty
    , showPinned = False
    , streams = []
    , streamsPanelOpen = False
    , streamsCollapsed = Set.empty
    , ttsEnabled = False
    , lastMessageId = Nothing
    , recording = False
    , pendingImage = Nothing
    }
