import {TFunction} from "i18next";

export const deposit_bonus_static_info = (t: TFunction) => ([
  {
    id: 1,
    icon: "box-black.png",
    title: t('popup:deposit.firstDepositBonus'),
    subTitle: t('popup:deposit.firstDepositBonusValue'),
    minAmount: 'popup:deposit.firstDepositMinimum',
    desc: 'popup:deposit.bonusCalculationDesc1'
  },
  {
    id: 2,
    icon: "box-red.png",
    title: t('popup:deposit.secondDepositBonus'),
    minAmount: 'popup:deposit.firstDepositMinimum',
    desc: 'popup:deposit.bonusCalculationDesc2'
  },
  {
    id: 3,
    icon: "box-purple.png",
    title: t('popup:deposit.thirdDepositBonus'),
    minAmount: 'popup:deposit.firstDepositMinimum',
    desc: 'popup:deposit.bonusCalculationDesc3'
  },
  {
    id: 4,
    icon: "box-blue.png",
    title: t('popup:deposit.fourthDepositBonus'),
    minAmount: 'popup:deposit.firstDepositMinimum',
    desc: 'popup:deposit.bonusCalculationDesc4'
  },
  {
    id: 5,
    icon: "deposit-info.png",
    title: t('popup:deposit.lgeFiveDepositBonus'),
    minAmount: 'popup:deposit.firstDepositMinimum',
    desc: 'popup:deposit.bonusCalculationDesc5'
  }
])
