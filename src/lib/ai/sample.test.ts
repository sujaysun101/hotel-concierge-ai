import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { answerFromHouseBook } from "./sample"
import { houseBook } from "../house-book"
import { buildLindenHouse } from "../demo/linden"

const graph = buildLindenHouse("demo")
const entries = houseBook(graph.property, graph.articles)

describe("house book answers", () => {
  it("answers breakfast from the house book", () => {
    const answer = answerFromHouseBook("What time is breakfast and can you do gluten-free?", entries, graph.property.rooms)
    assert.equal(answer.grounded, true)
    assert.match(answer.reply, /8:00/)
    assert.match(answer.reply, /gluten-free/i)
    assert.equal(answer.citations.length > 0, true)
  })

  it("does not invent a pool", () => {
    const answer = answerFromHouseBook("Do you have a pool or a hot tub?", entries, graph.property.rooms)
    assert.equal(answer.grounded, false)
    assert.equal(answer.escalate, true)
    assert.match(answer.reply, /house book/i)
    assert.doesNotMatch(answer.reply, /yes, we have/i)
  })

  it("does not invent a wifi password", () => {
    const answer = answerFromHouseBook("What's the wifi password?", entries, graph.property.rooms)
    assert.equal(answer.grounded, true)
    assert.match(answer.reply, /card/i)
    assert.doesNotMatch(answer.reply, /password is\s+(?!printed\b)\S+/i)
  })

  it("hands towels to the desk and still quotes the house book", () => {
    const answer = answerFromHouseBook(
      "Could we get two extra bath towels for the Garden Room?",
      entries,
      graph.property.rooms,
    )
    assert.equal(answer.grounded, true)
    assert.equal(answer.escalate, true)
    assert.equal(answer.request?.type, "towels")
    assert.equal(answer.request?.room, "Garden Room")
  })

  it("does not open a towel ticket for a where question", () => {
    const answer = answerFromHouseBook("Where are the extra towels?", entries, graph.property.rooms)
    assert.equal(answer.grounded, true)
    assert.equal(answer.request, null)
    assert.match(answer.reply, /cupboard/i)
  })
})
