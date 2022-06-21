import TurndownService from 'turndown'

const turndownService = new TurndownService()

exports.turndown = function (text) {
  return turndownService.turndown(text)
}
