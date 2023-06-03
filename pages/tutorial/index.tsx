import TutorialLayout from '@/components/TutorialLayout';
import { GetStaticProps } from 'next';

export default function Tutorial() {
  return (
    <div className='relative max-w-screen-xl px-4 py-10 mx-auto md:flex md:py-10 gap-x-6 md:flex-row' style={{ minHeight: 'calc(100vh - 60px)' }}>
      <TutorialLayout>
        <>
          <h1 className="text-ellipsis overflow-hidden">介绍</h1>
          <p>欢迎来到AI works 文档！</p>
          <h2>AI works是什么</h2>
          <p>AI works是一个集成了主流AI工具的平台，旨在帮助更多人轻松使用AI，提高生产力，让AI技术触手可及。无论你是初学者还是专业人士，AI works都可以提供适合你的工具和资源，让你更好地掌握和应用AI技术。</p>
          <p>AI works集成了多种主流的AI工具，例如chatGPT、midjourney等。这些工具可以帮助你完成各种任务，例如<strong>文案创作&创造、编码、查资料、翻译、专业顾问、创意图片生成</strong>等。你可以根据自己的需求选择合适的工具，并使用它们来解决具体的问题。</p>
          <p><strong>AI works由多名互联网大厂技术专家开发维护</strong>，提供了强有力的稳定性保障。这意味着你可以放心地使用这些工具，而不必担心它们会崩溃或出现其他问题。此外，AI works还提供了完善的技术支持和文档，帮助你更好地理解和使用这些工具。</p>
          <p>总之，AI works是一个非常有价值的平台，它可以帮助更多人轻松使用AI，并提高生产力。如果你对AI技术感兴趣，或者想要应用AI技术解决具体的问题，那么AI works将是一个非常好的选择。</p>
        </>
      </TutorialLayout>
    </div>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: { },
  };
}