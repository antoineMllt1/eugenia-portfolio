import React from 'react';
import { motion } from 'framer-motion';

const WaveScroll = ({ children, delay = 0 }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{
                opacity: 1,
                y: 0,
                transition: {
                    type: "spring",
                    bounce: 0.4,
                    duration: 1.2,
                    delay: delay
                }
            }}
            viewport={{ once: true, margin: "-50px" }}
        >
            {children}
        </motion.div>
    );
};

export default WaveScroll;
