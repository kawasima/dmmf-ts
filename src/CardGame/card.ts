type Suit = "Club" | "Diamond" | "Spade" | "Heart"

type Rank = "Two" | "Three" | "Four" | "Five" | "Six" | "Seven" | "Eight"
    | "Nine" | "Ten" | "Jack" | "Queen" | "King"

type Card = [ Suit, Rank ]

type Hand = Card[]
type Deck = Card[]

type Player = { name: string; hand: Hand }
type Game = { deck: Deck; players: Player[] }

type Deal = (deck:Deck) => [ Deck, Card ]
type PickupCard = (hand: Hand, card: Card) => Hand
