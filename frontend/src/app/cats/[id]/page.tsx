import CatDetailClient from './client';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function CatDetailPage({ params }: Props) {
  const { id } = await params;
  return <CatDetailClient catId={id} />;
}