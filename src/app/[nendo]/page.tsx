interface PageProps {
  params: {
    nendo: string;
  };
}

export default function ItemPage({ params }: PageProps) {
  const { nendo } = params;

  // itemId を使用して必要な処理を行う

  return (
    <div>
      <h1>nendo: {nendo}</h1>
      {/* ページの内容 */}
    </div>
  );
}