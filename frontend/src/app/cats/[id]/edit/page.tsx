import CatEditClient from './client';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function CatEditPage({ params }: Props) {
  const { id } = await params;
  return <CatEditClient catId={id} />;
}