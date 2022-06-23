import Link from 'next/link';
import BlurImage from './BlurImage';
import Date from './Date';

export default function BlogCard({ data }) {
  return (
    <Link href={`/${data.slug}`}>
      <a>
        <div className="ease overflow-hidden rounded-2xl border-2 border-gray-100 bg-white shadow-md transition-all duration-200 hover:-translate-y-1 hover:shadow-xl">
          {data.image ? (
            <BlurImage
              src={data.image}
              alt={data.title ?? 'Blog '}
              width={500}
              height={400}
              layout="responsive"
              objectFit="cover"
              placeholder="blur"
              blurDataURL={data.imageBlurhash ?? undefined}
            />
          ) : (
            <div className="absolute flex h-full w-full select-none items-center justify-center bg-gray-100 text-4xl text-gray-500">
              ?
            </div>
          )}
          <div className="h-36 border-t border-gray-200 py-8 px-5">
            <h3 className="font-cal text-xl tracking-wide">{data.title}</h3>
            <p className="text-md my-2 truncate italic text-gray-600">{data.description}</p>
            <p className="my-2 text-sm text-gray-600">
              Published <Date dateString={data.createdAt.toString()} />
            </p>
          </div>
        </div>
      </a>
    </Link>
  );
}
