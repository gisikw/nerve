module Markdown exposing (render)

{-| Minimal Markdown-to-Html renderer for chat messages.

Supports:

  - **bold** (`**text**`)
  - *italic* (`*text*`)
  - `inline code` (`` `text` ``)
  - Fenced code blocks (` ``` `)
  - > blockquotes
  - [links](url) (`[text](url)`)
  - Line breaks (preserved)

-}

import Html exposing (Html, a, blockquote, br, code, em, p, pre, span, strong, text)
import Html.Attributes exposing (class, href, rel, target)


type alias Match =
    { before : String
    , marker : Marker
    , inner : String
    , after : String
    }


render : String -> List (Html msg)
render input =
    let
        lines =
            String.split "\n" input
    in
    renderLines lines []


renderLines : List String -> List (List (Html msg)) -> List (Html msg)
renderLines lines acc =
    case lines of
        [] ->
            acc
                |> List.reverse
                |> List.intersperse [ br [] [] ]
                |> List.concat

        line :: rest ->
            if String.startsWith "```" line then
                let
                    ( codeLines, remaining ) =
                        takeUntilClosingFence rest []
                in
                renderLines remaining
                    ([ pre [ class "code-block" ]
                        [ code [] [ text (String.join "\n" codeLines) ] ]
                     ]
                        :: acc
                    )

            else if String.startsWith "> " line then
                let
                    ( quoteLines, remaining ) =
                        takeWhileQuote (line :: rest) []
                in
                renderLines remaining
                    ([ blockquote [ class "blockquote" ]
                        (List.map (\ql -> p [] (renderInline ql)) quoteLines)
                     ]
                        :: acc
                    )

            else
                renderLines rest (renderInline line :: acc)


takeUntilClosingFence : List String -> List String -> ( List String, List String )
takeUntilClosingFence lines acc =
    case lines of
        [] ->
            ( List.reverse acc, [] )

        line :: rest ->
            if String.startsWith "```" line then
                ( List.reverse acc, rest )

            else
                takeUntilClosingFence rest (line :: acc)


takeWhileQuote : List String -> List String -> ( List String, List String )
takeWhileQuote lines acc =
    case lines of
        [] ->
            ( List.reverse acc, [] )

        line :: rest ->
            if String.startsWith "> " line then
                takeWhileQuote rest (String.dropLeft 2 line :: acc)

            else if line == ">" then
                takeWhileQuote rest ("" :: acc)

            else
                ( List.reverse acc, lines )


renderInline : String -> List (Html msg)
renderInline input =
    parseInline input []


parseInline : String -> List (Html msg) -> List (Html msg)
parseInline remaining acc =
    if String.isEmpty remaining then
        List.reverse acc

    else
        case findNextMarker remaining of
            Nothing ->
                List.reverse (text remaining :: acc)

            Just match ->
                let
                    beforeNode =
                        if String.isEmpty match.before then
                            acc

                        else
                            text match.before :: acc

                    markerNode =
                        case match.marker of
                            Bold ->
                                strong [] [ text match.inner ]

                            Italic ->
                                em [] [ text match.inner ]

                            InlineCode ->
                                code [ class "inline-code" ] [ text match.inner ]

                            Link linkUrl ->
                                a [ href linkUrl, target "_blank", rel "noopener" ]
                                    [ text match.inner ]
                in
                parseInline match.after (markerNode :: beforeNode)


type Marker
    = Bold
    | Italic
    | InlineCode
    | Link String


findNextMarker : String -> Maybe Match
findNextMarker input =
    [ findPattern "**" "**" Bold input
    , findPattern "*" "*" Italic input
    , findPattern "`" "`" InlineCode input
    , findLink input
    ]
        |> List.filterMap identity
        |> List.sortBy (\m -> String.length m.before)
        |> List.head


findPattern : String -> String -> Marker -> String -> Maybe Match
findPattern open close marker input =
    case firstIndexOf open input of
        Nothing ->
            Nothing

        Just startIdx ->
            let
                afterOpen =
                    String.dropLeft (startIdx + String.length open) input
            in
            case firstIndexOf close afterOpen of
                Nothing ->
                    Nothing

                Just endIdx ->
                    let
                        inner =
                            String.left endIdx afterOpen

                        after =
                            String.dropLeft (endIdx + String.length close) afterOpen
                    in
                    if String.isEmpty inner then
                        Nothing

                    else
                        Just
                            { before = String.left startIdx input
                            , marker = marker
                            , inner = inner
                            , after = after
                            }


findLink : String -> Maybe Match
findLink input =
    case firstIndexOf "[" input of
        Nothing ->
            Nothing

        Just bracketIdx ->
            let
                afterBracket =
                    String.dropLeft (bracketIdx + 1) input
            in
            case firstIndexOf "](" afterBracket of
                Nothing ->
                    Nothing

                Just closeBracketIdx ->
                    let
                        linkText =
                            String.left closeBracketIdx afterBracket

                        afterCloseBracket =
                            String.dropLeft (closeBracketIdx + 2) afterBracket
                    in
                    case firstIndexOf ")" afterCloseBracket of
                        Nothing ->
                            Nothing

                        Just parenIdx ->
                            let
                                url =
                                    String.left parenIdx afterCloseBracket

                                after =
                                    String.dropLeft (parenIdx + 1) afterCloseBracket
                            in
                            if String.isEmpty linkText || String.isEmpty url then
                                Nothing

                            else
                                Just
                                    { before = String.left bracketIdx input
                                    , marker = Link url
                                    , inner = linkText
                                    , after = after
                                    }


firstIndexOf : String -> String -> Maybe Int
firstIndexOf needle haystack =
    let
        len =
            String.length haystack

        needleLen =
            String.length needle

        search idx =
            if idx > len - needleLen then
                Nothing

            else if String.slice idx (idx + needleLen) haystack == needle then
                Just idx

            else
                search (idx + 1)
    in
    if needleLen == 0 then
        Nothing

    else
        search 0
