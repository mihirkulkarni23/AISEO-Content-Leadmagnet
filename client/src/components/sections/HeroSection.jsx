import { motion } from 'framer-motion'
import InternalLinksCrawler from '../InternalLinksCrawler'

const HeroSection = ({ loading, onLoadingChange, onDataUpdate }) => {
  return (
    <div 
      className="w-full relative overflow-hidden"
      style={{
        background: 'radial-gradient(50% 50% at 50% 50%, #0a302c 4%, #05180c)',
        borderBottomLeftRadius: '50px',
        borderBottomRightRadius: '50px',
        height: '720px',
        willChange: 'transform'
      }}
    >
      {/* Decorative Elements */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute top-20 left-10 w-24 h-24 bg-teal-500/10 rounded-full blur-2xl"
      ></motion.div>
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, delay: 0.2, ease: "easeOut" }}
        className="absolute top-40 left-20 w-32 h-32 bg-teal-400/10 rounded-full blur-3xl"
      ></motion.div>
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, delay: 0.4, ease: "easeOut" }}
        className="absolute bottom-20 left-1/4 w-40 h-40 bg-teal-600/10 rounded-full blur-2xl"
      ></motion.div>
      
      <div className="container mx-auto px-4 h-full flex items-center justify-center pt-[50px] relative">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-10 w-full">
          {/* Left Side - Headline and Description */}
          <div className="lg:w-1/2 mb-10 lg:mb-0 relative">
            {/* Abstract Line Decoration */}
            <motion.div 
              initial={{ height: 0 }}
              animate={{ height: "100%" }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="absolute -left-4 top-0 w-1 bg-gradient-to-b from-teal-400/50 to-transparent"
            ></motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-white text-5xl font-bold leading-tight mb-6 relative"
            >
              <span className="block">AI-Powered Content Strategy</span>
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="block mt-2"
              >
                For Maximum SEO Impact
              </motion.span>
              {/* Decorative dots */}
              <div className="absolute -right-8 top-1/2 flex flex-col gap-1">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.6, duration: 0.4 }}
                  className="w-1.5 h-1.5 rounded-full bg-teal-400"
                ></motion.div>
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.7, duration: 0.4 }}
                  className="w-1.5 h-1.5 rounded-full bg-teal-400/60"
                ></motion.div>
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.8, duration: 0.4 }}
                  className="w-1.5 h-1.5 rounded-full bg-teal-400/30"
                ></motion.div>
              </div>
            </motion.h1>
            
            <div className="space-y-6 relative">
              <motion.p 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="text-xl"
              >
                <span className="text-gray-200">
                  Unlock your website's full potential with AI-powered keyword analysis and content optimization. Our advanced system analyzes:
                </span>
              </motion.p>
              
              <ul className="text-lg space-y-3 relative">
                {/* Decorative line connecting bullet points */}
                <motion.div 
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ delay: 1, duration: 0.8 }}
                  className="absolute -left-6 top-2 bottom-2 w-px bg-gradient-to-b from-teal-400/30 via-teal-400/50 to-teal-400/30 origin-top"
                ></motion.div>
                {[
                  "Internal Links & Content Structure",
                  "User Intent & Keyword Clusters",
                  "Search Metrics & Competition"
                ].map((item, index) => (
                  <motion.li 
                    key={item}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1 + (index * 0.2), duration: 0.5 }}
                    className="flex items-center text-teal-400"
                  >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                    </svg>
                    {item}
                  </motion.li>
                ))}
              </ul>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.8, duration: 0.5 }}
                className="mt-8"
              >
                <p className="text-xl text-teal-400 font-medium">
                  Get ready to transform your content strategy with AI-powered insights in just minutes!
                </p>
              </motion.div>
            </div>
          </div>

          {/* Right Side - Form */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="lg:w-5/12"
          >
            <InternalLinksCrawler 
              loading={loading} 
              onLoadingChange={onLoadingChange}
              onDataUpdate={onDataUpdate}
            />
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default HeroSection 