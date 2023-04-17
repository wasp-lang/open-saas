export default function MainPage() {
  return (
    <div>
      <div className='mx-auto max-w-7xl pt-10 pb-24 sm:pb-32 lg:grid lg:grid-cols-2 lg:gap-x-8 lg:py-32 lg:px-8'>
        <div className='px-6 lg:px-0 lg:pt-4'>
          <div className='mx-auto max-w-2xl'>
            <div className='max-w-lg'>
              <h1 className=' text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl'>SaaS Template</h1>

              <h2 className='ml-4 max-w-2xl text-2xl f tracking-tight text-gray-800 slg:col-span-2 xl:col-auto'>
                for the PERN stack
              </h2>
              <h2 className='ml-4 max-w-2xl text-md f tracking-tight text-gray-600 slg:col-span-2 xl:col-auto'>
                Postgres/Prisma, Express, React, Node
              </h2>

              <p className='mt-4 text-lg leading-8 text-gray-600'>
                Hey 🧙‍♂️! This template will help you get a SaaS App up and running in no time. It's got:
              </p>
              <ul className='list-disc ml-8 my-2 leading-8 text-gray-600'>
                <li>Stripe integration</li>
                <li>Authentication w/ Google</li>
                <li>OpenAI GPT API configuration</li>
                <li>Managed Server-Side Routes</li>
                <li>Tailwind styling</li>
                <li>Client-side Caching</li>
                <li>
                  One-command{' '}
                  <a href='https://wasp-lang.dev/docs/deploying' className='underline' target='_blank'>
                    Deploy 🚀
                  </a>
                </li>
              </ul>
              <p className='mt-4 text-lg leading-8 text-gray-600'>
                Make sure to check out the <code>README.md</code> file and add your <code>env</code> variables before
                you begin
              </p>
              <div className='mt-10 flex items-center gap-x-6'>
                <span className='text-sm font-semibold leading-6 text-gray-900'>Made with Wasp &nbsp; {' = }'}</span>
                <a
                  href='https://wasp-lang.dev/docs'
                  className='rounded-md bg-yellow-500 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-yellow-400 hover:text-black/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500'
                >
                  Read the Wasp Docs
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className='mt-20 sm:mt-24 lg:mx-0 md:mx-auto md:max-w-2xl lg:w-screen lg:mt-0 '>
          <div className='shadow-lg md:rounded-3xl relative isolate overflow-hidden'>
            <div className='bg-yellow-500 [clip-path:inset(0)] md:[clip-path:inset(0_round_theme(borderRadius.3xl))]'>
              <div
                className='absolute -inset-y-px -z-10 ml-40 w-[200%] bg-yellow-100 opacity-20 ring-1 ring-inset ring-white '
                aria-hidden='true'
              />
              <div className='relative px-6 pt-8 sm:pt-16 md:pl-16 md:pr-0'>
                <div className='mx-auto max-w-2xl md:mx-0 md:max-w-none'>
                  <div className='overflow-hidden rounded-tl-xl bg-gray-900'>
                    <div className='bg-white/40 ring-1 ring-white/5'>
                      <div className='-mb-px flex text-sm font-medium leading-6 text-gray-400'>
                        <div className='border-b border-r border-b-white/20 border-r-white/10 bg-white/5 py-2 px-4 text-white'>
                          main.wasp
                        </div>
                        <div className='border-r border-gray-600/10 py-2 px-4'>App.tsx</div>
                      </div>
                    </div>
                    <div className='px-6 pt-6 pb-14 bg-gray-100'>
                      <code className='language-javascript' style={{ whiteSpace: 'pre' }}>
                        <span>{'app todoApp {'}</span>
                        <br />
                        <span>{'  '}</span>
                        <span style={{ color: '#986801' }}>title</span>
                        <span>: </span>
                        <span style={{ color: '#50a14f' }}>"ToDo App"</span>
                        <span>, </span>
                        <span style={{ color: '#a0a1a7', fontStyle: 'italic' }}>/* visible in the browser tab */</span>
                        <br />
                        <span>{'  '}</span>
                        <span style={{ color: '#986801' }}>auth</span>
                        <span>{': {'} </span>
                        <span style={{ color: '#a0a1a7', fontStyle: 'italic' }}>
                          /* full-stack auth out-of-the-box */
                        </span>
                        <br />
                        <span>{'  '}</span>
                        <span style={{ color: '#986801' }}>userEntity</span>
                        <span>: User,</span>
                        <br />
                        <span>{'  '}</span>
                        <span style={{ color: '#986801' }}>externalAuthEntity</span>
                        <span>: SocialLogin,</span>
                        <br />
                        <span>{'  '}</span>
                        <span style={{ color: '#986801' }}>methods</span>
                        <span>{': {'}</span>
                        <br />
                        <span>{'    '}</span>
                        <span style={{ color: '#986801' }}>google</span>
                        <span>{': {}'}</span>
                        <br></br>
                        {'  }'}
                        <br></br>
                        {'}'}
                        {/* */}
                        <br />
                        {/* */}
                        <br />
                        <span>{'route RootRoute { '}</span>
                        <span style={{ color: '#986801' }}>path</span>
                        <span>: </span>
                        <span style={{ color: '#50a14f' }}>'/'</span>
                        <span>, </span>
                        <span style={{ color: '#986801' }}>to</span>
                        <span>{': MainPage }'}</span>
                        <br />
                        {'page MainPage {'}
                        <span> </span>
                        <span style={{ color: '#a0a1a7', fontStyle: 'italic' }}>
                          {'/* Only logged in users can access this. */'}
                        </span>
                        <span></span>

                        <br />
                        <span>{'  '}</span>
                        <span style={{ color: '#986801' }}>authRequired</span>
                        <span>: </span>
                        <span style={{ color: '#0184bb' }}>true</span>
                        <span>,</span>
                        <br />
                        <span>{'  '}</span>
                        <span style={{ color: '#986801' }}>component</span>
                        <span>: </span>
                        <span style={{ color: '#a626a4' }}>import</span>
                        <span> Main </span>
                        <span style={{ color: '#a626a4' }}>from</span>
                        <span> </span>
                        <span style={{ color: '#50a14f' }}>'@client/Main.jsx'</span>
                        <br />
                        <span></span>
                        {'}'}
                      </code>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
