import { ethers } from "hardhat";
import { expect, assert } from "chai";
import { Shale } from "../typechain-types/Shale";

describe("Shale", function () {
    async function deploy(): Promise<Shale> {
        const Shale = await ethers.getContractFactory("Shale");
        const shale = await Shale.deploy();

        return shale;
    }

    async function put(shale: Shale) {
        return await shale.putProduct(
            '120000000000000000',//Fixed Price：0.12 FIL
            "{\"cpu\":{\"cores\":\"2\",\"frequency\":\"2.9GHz\"},\"gpu\":{\"process\":\"RTX 2060\",\"vram\":\"8GB\"},\"ram\":{\"total\":\"16GB\"},\"disk\":{\"total\":\"256GB\",\"free\":\"220GB\"}}",
        );
    }

    async function putAndGetMarketList(shale: Shale, ownerFilter: string) {
        await put(shale);
        await put(shale);
        await put(shale);
        await put(shale);
        await put(shale);
        await put(shale);

        return await shale.getMarketList(ownerFilter);
    }

    describe("Deployment", function () {
        it("Should deploy is ok", async function () {
            const shale = await deploy();

            assert.isNotNull(shale);
            assert.isNotNull(shale.address);
        });

        it("Should put product is ok", async function () {
            const shale = await deploy();

            const tx = await put(shale);

            assert.isNotNull(tx.hash);
        });

        it("Should get market list is ok", async function () {
            const shale = await deploy();

            const list = await putAndGetMarketList(shale, '0x0000000000000000000000000000000000000000');

            expect(list.length).gt(0);
        });

        it("Should take product is ok", async function () {
            const ownerShale = await deploy();
            const [owner, otherAccount] = await ethers.getSigners();

            const list = await putAndGetMarketList(ownerShale, '0x0000000000000000000000000000000000000000');
            expect(list.length).gt(0);

            const otherAccountShale = ownerShale.connect(otherAccount);
            const tx = await otherAccountShale.takeProduct(list[0].ProductId, 5, 'abc', { value: '600000000000000000' });

            assert.isNotNull(tx.hash);
        });

        it("Should get rent out products", async function () {
            const shale = await deploy();

            const list = await putAndGetMarketList(shale, '0x0000000000000000000000000000000000000000');

            expect(list.length).gt(0);

            const [owner] = await ethers.getSigners();
            const rentOuts = await shale.getRentOutProduct(owner.address);

            expect(rentOuts.length).gt(0);
        });

        it("Should get rent out orders", async function () {
            const ownerShale = await deploy();
            const [owner, otherAccount] = await ethers.getSigners();

            const list = await putAndGetMarketList(ownerShale, '0x0000000000000000000000000000000000000000');

            expect(list.length).gt(0);

            const otherAccountShale = ownerShale.connect(otherAccount);
            const tx = await otherAccountShale.takeProduct(list[0].ProductId, 5, 'abc', { value: '600000000000000000' });

            assert.isNotNull(tx.hash);

            const rentOuts = await ownerShale.getRentOutOrders(owner.address);

            expect(rentOuts.length).gt(0);
        });

        it("Should get rent orders", async function () {
            const ownerShale = await deploy();
            const [owner, otherAccount] = await ethers.getSigners();

            const list = await putAndGetMarketList(ownerShale, '0x0000000000000000000000000000000000000000');

            expect(list.length).gt(0);

            const otherAccountShale = ownerShale.connect(otherAccount);
            const tx = await otherAccountShale.takeProduct(list[0].ProductId, 5, 'abc', { value: '600000000000000000' });

            assert.isNotNull(tx.hash);

            const rents = await otherAccountShale.getRentOrders(otherAccount.address);

            expect(rents.length).gt(0);
        });

        it("Whole process", async function () {
            const ownerShale = await deploy();
            const [owner, otherAccount] = await ethers.getSigners();

            const list = await putAndGetMarketList(ownerShale, '0x0000000000000000000000000000000000000000');

            expect(list.length).gt(0);

            const otherAccountShale = ownerShale.connect(otherAccount);
            const tx = await otherAccountShale.takeProduct(list[0].ProductId, 5, 'pubkeypubkeypubkeypubkeypubkeypubkeypubkeypubkeypubkeypubkeypubkeypubkey', { value: '600000000000000000' });

            assert.isNotNull(tx.hash);

            const rents = await otherAccountShale.getRentOrders(otherAccount.address);

            expect(rents.length).gt(0);

            const setupTx = await ownerShale.setupOrder(rents[0].OrderId, true, '127.0.0.1:22');

            assert.isNotNull(setupTx.hash);

            const closeTx = await ownerShale.closeOrder(rents[0].OrderId);

            assert.isNotNull(closeTx.hash);
        });
    })
});