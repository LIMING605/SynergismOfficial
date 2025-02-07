import i18next from 'i18next'
import { DOMCacheGetOrSet } from './Cache/DOM'
import { CorruptionLoadout, type Corruptions, corruptionsSchema } from './Corruptions'
import { player } from './Synergism'
import { IconSets } from './Themes'

export type AscensionModifiers = 'GlobalSpeed'

export type CampaignLoadout = Corruptions
export type CampaignModifiers = Partial<Record<AscensionModifiers, number>>

export type CampaignKeys = 'test1' | 'test2' | 'test3'

export interface ICampaignManagerData {
  currentCampaign?: CampaignKeys | undefined
  campaigns?: Record<CampaignKeys, number>
}

export interface ICampaignData {
  campaignCorruptions: Partial<Corruptions>
  campaignModifiers: CampaignModifiers
  limit: number
  isMeta: boolean
}

export class CampaignManager {
  #totalCampaignTokens: number
  #currentCampaign: Campaign | undefined
  #campaigns: Record<CampaignKeys, Campaign>

  constructor (campaignManagerData?: ICampaignManagerData) {
    this.#campaigns = {
      test1: new Campaign(campaignDatas.test1, 'test1', campaignManagerData?.campaigns?.test1 ?? 0),
      test2: new Campaign(campaignDatas.test2, 'test2', campaignManagerData?.campaigns?.test2 ?? 0),
      test3: new Campaign(campaignDatas.test3, 'test3', campaignManagerData?.campaigns?.test3 ?? 0)
    }

    this.#currentCampaign = campaignManagerData?.currentCampaign
      ? this.#campaigns[campaignManagerData.currentCampaign]
      : undefined

    if (campaignManagerData?.currentCampaign !== undefined) {
      this.#currentCampaign = this.#campaigns[campaignManagerData.currentCampaign]
      player.corruptions.used = new CorruptionLoadout(this.#currentCampaign.campaignCorruptions)
    }

    this.#totalCampaignTokens = this.computeTotalCampaignTokens()
  }

  computeTotalCampaignTokens () {
    let sum = 0
    for (const campaign of Object.values(this.#campaigns)) {
      sum += campaign.computeTokenValue()
    }
    return sum
  }

  get tokens () {
    return this.#totalCampaignTokens
  }

  get current () {
    return this.#currentCampaign
  }

  // Store as this in player
  get c10Completions (): Record<CampaignKeys, number> {
    return Object.fromEntries(
      Object.entries(this.#campaigns).map(([key, value]) => [key, value.c10Completions])
    ) as Record<CampaignKeys, number>
  }
}

export class Campaign {
  #name: string
  #description: string
  #campaignCorruptions: CampaignLoadout
  #campaignModifiers: CampaignModifiers
  #limit: number
  #isMeta: boolean
  #c10Completions = 0

  constructor (campaignData: ICampaignData, key: string, c10?: number) {
    this.#name = i18next.t(`campaigns.data.${key}.name`)
    this.#description = i18next.t(`campaigns.data.${key}.description`)
    this.#campaignCorruptions = corruptionsSchema.parse(campaignData.campaignCorruptions)
    this.#campaignModifiers = campaignData.campaignModifiers
    this.#limit = campaignData.limit
    this.#isMeta = campaignData.isMeta
    this.#c10Completions = c10 ?? 0
  }

  public computeTokenValue = () => {
    const metaMultiplier = this.#isMeta ? 2 : 1
    return metaMultiplier * Math.min(this.c10Completions, this.#limit)
  }

  public createUsableLoadout = (): CorruptionLoadout => {
    return new CorruptionLoadout(this.#campaignCorruptions)
  }

  public set c10Completions (value: number) {
    this.#c10Completions = Math.min(value, this.#limit)
  }

  public get campaignCorruptions () {
    return this.#campaignCorruptions
  }

  public get c10Completions () {
    return this.#c10Completions
  }

  public get name () {
    return this.#name
  }

  public get description () {
    return this.#description
  }

  public get limit () {
    return this.#limit
  }

  public get campaignModifiers () {
    return this.#campaignModifiers
  }

  public get isMeta () {
    return this.#isMeta
  }
}

export const campaignDatas: Record<CampaignKeys, ICampaignData> = {
  test1: {
    campaignCorruptions: {
      viscosity: 1
    },
    campaignModifiers: {
      GlobalSpeed: 1
    },
    isMeta: true,
    limit: 10
  },
  test2: {
    campaignCorruptions: {
      viscosity: 1,
      deflation: 1
    },
    campaignModifiers: {
      GlobalSpeed: 1
    },
    isMeta: true,
    limit: 15
  },
  test3: {
    campaignCorruptions: {
      viscosity: 1,
      deflation: 1,
      dilation: 1
    },
    campaignModifiers: {
      GlobalSpeed: 1
    },
    isMeta: true,
    limit: 20
  }
}

export const campaignTest = () => {
  const campaignIconDiv = DOMCacheGetOrSet('campaignIconGrid')

  for (let i = 0; i < 50; i++) {
    const campaignIcon = document.createElement('img')
    campaignIcon.classList.add('campaignIcon')
    campaignIcon.src = `Pictures/${IconSets[player.iconSet][0]}/Quark.png`
    campaignIconDiv.appendChild(campaignIcon)
  }
}
