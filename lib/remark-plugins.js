import Link from 'next/link';
import { visit } from 'unist-util-visit';

// import { getTweets } from 'lib/twitter';

export function replaceLinks(options) {
  // this is technically not a remark plugin but it
  // replaces internal links with <Link /> component
  // and external links with <a target="_blank" />
  return options.href.startsWith('/') || options.href === '' ? (
    <Link href={options.href}>
      <a className="cursor-pointer">{options.children}</a>
    </Link>
  ) : (
    <a href={options.href} target="_blank" rel="noopener noreferrer">
      {options.children} ↗
    </a>
  );
}

// export function replaceTweets() {
//   return (tree) =>
//     new Promise(async (resolve, reject) => {
//       const nodesToChange = [];
//       visit(tree, 'text', (node) => {
//         if (
//           node.value.match(
//             /https?:\/\/twitter\.com\/(?:#!\/)?(\w+)\/status(?:es)?\/(\d+)([^\?])(\?.*)?/g
//           )
//         ) {
//           nodesToChange.push({
//             node
//           });
//         }
//       });
//       for (const { node } of nodesToChange) {
//         try {
//           node.type = 'html';
//           const mdx = await getTweet(node);
//           node.value = mdx;
//         } catch (e) {
//           console.log('ERROR', e);
//           return reject(e);
//         }
//       }
//       resolve();
//     });
// }

// async function getTweet(node) {
//   const regex = /\/status\/(\d+)/gm;
//   const matches = regex.exec(node.value);
//   if (!matches) throw new Error(`Failed to get tweet: ${node}`);
//   const id = matches[1];
//   const tweetData = await getTweets(id);
//   node.value = "<Tweet id='" + id + "' metadata={`" + JSON.stringify(tweetData) + '`}/>';
//   return node.value;
// }

export function replaceExamples(prisma) {
  return (tree) =>
    new Promise(async (resolve, reject) => {
      const nodesToChange = [];
      visit(tree, 'mdxJsxFlowElement', (node) => {
        if (node.name === 'Examples') {
          nodesToChange.push({
            node
          });
        }
      });
      for (const { node } of nodesToChange) {
        try {
          node.type = 'html';
          node.value = await getExamples(node, prisma);
        } catch (e) {
          console.log('ERROR', e);
          return reject(e);
        }
      }
      resolve();
    });
}

async function getExamples(node, prisma) {
  const names = node?.attributes[0].value.split(',');
  const data = [];
  for (let i = 0; i < names.length; i++) {
    const results = await prisma.example.findUnique({
      where: {
        id: parseInt(names[i])
      }
    });
    data.push(results);
  }
  return `<Examples data={${JSON.stringify(data)}} />`;
}
