import {remark} from 'remark'
import html from 'remark-html'
import remarkBreaks from 'remark-breaks'

export async function markdownToHTML(content) {
  let process = await remark().use(html).use(remarkBreaks).process(content)
  const processedHTML = await String(process)
  return processedHTML
}