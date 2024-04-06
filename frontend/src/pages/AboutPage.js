import React from 'react';
import NavBar from '../components/NavBar'; // Adjust the path as necessary

const AboutPage = () => {
  return (
    <div className="mt-3">
      <NavBar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center my-10">About Sepolia Roulette</h1>
        <p className="text-lg text-justify mb-2">
          Welcome to our decentralized casino game — a pioneering platform that revolutionizes online gaming through blockchain technology. Leveraging the power of the Ethereum blockchain, our game offers an engaging, fair, and transparent gaming experience. With a design that echoes the excitement of roulette, our platform stands apart by fostering direct competition among players rather than against the house, since, in our world, the house doesn't exist.
        </p>
        <h2 className="text-2xl font-bold mb-2 mt-8">Our Value Proposition</h2>
        <p className="text-lg text-justify mb-2">
          At the heart of our project is the commitment to fairness and transparency. Built on an open-source Solidity contract, our game ensures that every transaction and outcome is verifiable, fostering trust and integrity in online gaming. The decentralization of our platform means there's no traditional "house" that takes a cut—every bet placed is redistributed among winners, making every game round a fair shot for all participants. Besides providing thrilling entertainment, our game is a testament to the reliability and potential of decentralized platforms.
        </p>
        <h2 className="text-2xl font-bold mb-2 mt-8">How Our Game Works</h2>
        <p className="text-lg text-justify mb-2">
          Players stake a predetermined unit of Sepolia, betting on various outcomes in rounds filled with anticipation and strategy. Our Ethereum smart contract collects these stakes into a jackpot, which is then distributed to the winners based on the accuracy of their predictions and the risks associated with their bets. Our game mechanics are designed to ensure that the thrill of competition is always front and center, with all players competing in simultaneous rounds for the collective pot.
        </p>
        <p className="text-lg text-justify mb-2">
          Building the Project Our project's backbone is a meticulously crafted Solidity contract. It manages stakes, calculates fair payouts, and executes the distribution of winnings with precision. The contract interacts with an external random oracle to ensure unpredictable, fair outcomes for every game round. To bridge the gap between blockchain technology and user experience, we've developed a user-friendly interface hosted on netlify. This interface, crafted with the latest web technologies like React and Tailwind, connects seamlessly to our smart contract via web3.js. Players can easily join games, place bets, and view outcomes—all within a secure environment enabled by MetaMask wallet integration.
        </p>
        <h2 className="text-2xl font-bold mb-2 mt-8">Gamble Transparently</h2>
        <p className="text-lg text-justify mb-4">
          By choosing our decentralized casino game, you're not just seeking entertainment; you're participating in the future of online gaming—a future that's fair, transparent, and immensely enjoyable. Join us in this exciting journey and discover the unmatched thrill of decentralized gaming.
        </p>
      </div>
    </div>
  );
};

export default AboutPage;