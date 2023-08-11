import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosRequestConfig } from 'axios';
import { firstValueFrom, map } from 'rxjs';
import regulatedWallet from "../data/regulatedWallet.json"
import { ethers } from 'ethers';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(private readonly httpService: HttpService, private readonly config: ConfigService) { }

  getHello(): string {
    return 'Hello World!';
  }

  getWallet(): string {
    return 'Hello World!';
  }

  async getTransaction(address: string): Promise<any> {
    const axiosConfig: AxiosRequestConfig = {
      method: 'get',
      url: `https://deep-index.moralis.io/api/v2/${address}/verbose?chain=eth`,
      headers: {
        'accept': 'application/json',
        'X-API-Key': this.config.get("X_API_KEY"),
      }
    };

    const getBalance: AxiosRequestConfig = {
      method: 'get',
      url: `https://deep-index.moralis.io/api/v2/${address}/balance?chain=eth`,
      headers: {
        'accept': 'application/json',
        'X-API-Key': this.config.get("X_API_KEY"),
      }
    }

    const txData = await firstValueFrom(this.httpService.request(axiosConfig).pipe(map((res) => {
      return res.data?.result
    })))

    const balance = await firstValueFrom(this.httpService.request(getBalance).pipe(map((res) => {
      return res.data?.balance
    })))

    const filteredTransactions = txData.filter((tx: any) =>
      !!regulatedWallet.find((wallet) => tx.from_address === wallet.address?.toLocaleLowerCase())
    );

    const transactionsWithWalletNames = filteredTransactions.map((tx: any) => {
      const matchingWallet = regulatedWallet.find((wallet) => tx.from_address === wallet.address);
      return matchingWallet.name
    });

    const sumValueInRegulated = filteredTransactions.reduce((sum: any, current: any) => sum + parseInt(current?.value), 0);

    const sumValueIn = txData.filter((tx: any) =>
      tx.to_address === address.toLocaleLowerCase()).reduce((sum: any, current: any) => sum + parseInt(current.value), 0);

    const sumValueOut = txData.filter((tx: any) =>
      tx.from_address === address.toLocaleLowerCase()).reduce((sum: any, current: any) => sum + parseInt(current.value), 0);

    const totalGas = txData.reduce((sum: any, current: any) =>
      sum + (parseInt(current.gas_price) * parseInt(current.receipt_gas_used))
      , 0);

    return {
      totalIn: ethers.formatEther(BigInt(sumValueIn)),
      totalRegulatedIn: ethers.formatEther(BigInt(sumValueInRegulated)),
      regulatedWallet: transactionsWithWalletNames.filter((value: any, index: number) => transactionsWithWalletNames.indexOf(value) === index),
      totalOut: ethers.formatEther(BigInt(sumValueOut)),
      totalGas: ethers.formatEther(BigInt(totalGas)),
      nativeBalance: ethers.formatEther(BigInt(balance)),
    };
  }
}
