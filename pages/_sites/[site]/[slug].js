import BlogCard from 'components/BlogCard';
import BlurImage from 'components/BlurImage';
import Date from 'components/Date';
import Examples from 'components/mdx/Examples';
import Tweet from 'components/mdx/Tweet';
import Layout from 'components/sites/Layout';
import Loader from 'components/sites/Loader';
import prisma from 'lib/prisma';
import { replaceLinks } from 'lib/remark-plugins';
import { MDXRemote } from 'next-mdx-remote';
import { serialize } from 'next-mdx-remote/serialize';
import { useRouter } from 'next/router';
import { remark } from 'remark';
import remarkMdx from 'remark-mdx';

const components = {
  a: replaceLinks,
  BlurImage,
  Examples,
  Tweet
};
export default function Post({ stringifiedAdjacentPosts, stringifiedData }) {
  const router = useRouter();

  if (router.isFallback) {
    return <Loader />;
  }

  const data = JSON.parse(stringifiedData);
  const adjacentPosts = JSON.parse(stringifiedAdjacentPosts);

  const meta = {
    description: data.description,
    logo: '/logo.png',
    ogImage: data.image,
    ogUrl: `https://${data.site?.subdomain}.platform-cms.vercel.app/${data.slug}`,
    title: data.title
  };

  return (
    <Layout meta={meta} subdomain={data.site?.subdomain ?? undefined}>
      <div className="flex flex-col items-center justify-center">
        <div className="m-auto w-full text-center md:w-7/12">
          <p className="m-auto my-5 w-10/12 text-sm font-light text-gray-500 md:text-base">
            <Date dateString={data.createdAt.toString()} />
          </p>
          <h1 className="mb-10 font-cal text-3xl font-bold text-gray-800 md:text-6xl">
            {data.title}
          </h1>
          <p className="text-md m-auto w-10/12 text-gray-600 md:text-lg">{data.description}</p>
        </div>
        <a
          // if you are using Github OAuth, you can get rid of the Twitter option
          href={
            data.site?.user?.username
              ? `https://twitter.com/${data.site.user.username}`
              : `https://github.com/${data.site?.user?.gh_username}`
          }
          rel="noreferrer"
          target="_blank">
          <div className="my-8">
            <div className="relative inline-block h-8 w-8 overflow-hidden rounded-full align-middle md:h-12 md:w-12">
              {data.site?.user?.image ? (
                <BlurImage
                  alt={data.site?.user?.name ?? 'User Avatar'}
                  height={80}
                  src={data.site.user.image}
                  width={80}
                />
              ) : (
                <div className="absolute flex h-full w-full select-none items-center justify-center bg-gray-100 text-4xl text-gray-500">
                  ?
                </div>
              )}
            </div>
            <div className="text-md ml-3 inline-block align-middle md:text-lg">
              by <span className="font-semibold">{data.site?.user?.name}</span>
            </div>
          </div>
        </a>
      </div>
      <div className="lg:2/3 relative m-auto mb-10 h-80 w-full max-w-screen-lg overflow-hidden md:mb-20 md:h-150 md:w-5/6 md:rounded-2xl">
        {data.image ? (
          <BlurImage
            alt={data.title ?? 'Post image'}
            layout="fill"
            objectFit="cover"
            placeholder="blur"
            blurDataURL={data.imageBlurhash ?? undefined}
            src={data.image}
          />
        ) : (
          <div className="absolute flex h-full w-full select-none items-center justify-center bg-gray-100 text-4xl text-gray-500">
            ?
          </div>
        )}
      </div>

      <article className="prose-md prose m-auto w-11/12 sm:prose-lg sm:w-3/4">
        <MDXRemote {...data.mdxSource} components={components} />
      </article>

      {adjacentPosts.length > 0 && (
        <div className="relative mt-10 mb-20 sm:mt-20">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-2 text-sm text-gray-500">Continue Reading</span>
          </div>
        </div>
      )}
      {adjacentPosts && (
        <div className="mx-5 mb-20 grid max-w-screen-xl grid-cols-1 gap-x-4 gap-y-8 md:grid-cols-2 lg:mx-12 xl:grid-cols-3 2xl:mx-auto">
          {adjacentPosts.map((data, index) => (
            <BlogCard key={index} data={data} />
          ))}
        </div>
      )}
    </Layout>
  );
}
export const getStaticPaths = async () => {
  const posts = await prisma.post.findMany({
    where: {
      published: true
      // you can remove this if you want to generate all sites at build time
      // site: {
      //   subdomain: 'demo'
      // }
    },
    select: {
      slug: true,
      site: {
        select: {
          subdomain: true,
          customDomain: true
        }
      }
    }
  });
  return {
    paths: posts.flatMap((post) => {
      if (post.site === null || post.site.subdomain === null) return [];
      if (post.site.customDomain) {
        return [
          {
            params: {
              site: post.site.customDomain,
              slug: post.slug
            }
          },
          {
            params: {
              site: post.site.subdomain,
              slug: post.slug
            }
          }
        ];
      } else {
        return {
          params: {
            site: post.site.subdomain,
            slug: post.slug
          }
        };
      }
    }),
    fallback: true
  };
};

export const getStaticProps = async ({ params }) => {
  if (!params) {
    throw new Error('No path parameters found');
  }

  const { site, slug } = params;

  let filter = {
    subdomain: site
  };

  if (site.includes('.')) {
    filter = {
      customDomain: site
    };
  }

  const data = await prisma.post.findFirst({
    where: {
      site: {
        ...filter
      },
      slug
    },
    include: {
      site: {
        include: {
          user: true
        }
      }
    }
  });

  if (!data) {
    return { notFound: true, revalidate: 10 };
  }

  const [mdxSource, adjacentPosts] = await Promise.all([
    getMdxSource(data.content),
    prisma.post.findMany({
      where: {
        site: {
          ...filter
        },
        published: true,
        NOT: {
          id: data.id
        }
      },
      select: {
        slug: true,
        title: true,
        createdAt: true,
        description: true,
        image: true,
        imageBlurhash: true
      }
    })
  ]);

  return {
    props: {
      stringifiedData: JSON.stringify({
        ...data,
        mdxSource
      }),
      stringifiedAdjacentPosts: JSON.stringify(adjacentPosts)
    },
    revalidate: 20
  };
};

async function getMdxSource(postContents) {
  // Use remark plugins to convert markdown into HTML string
  const processedContent = await remark()
    // Native remark plugin that parses markdown into MDX
    .use(remarkMdx)
    // Replaces tweets with static <Tweet /> component
    // .use(replaceTweets)
    // Replaces examples with <Example /> component (only for demo.vercel.pub)
    // .use(() => replaceExamples(prisma))
    .process(postContents);
  // Convert converted html to string format
  const contentHtml = String(processedContent);
  // Serialize the content string into MDX
  return await serialize(contentHtml);
}
