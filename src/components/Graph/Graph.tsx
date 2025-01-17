import { Center, SlideFade } from '@chakra-ui/react'
import {
  AssetMarketData,
  getAssetHistory,
  HistoryData,
  HistoryTimeframe
} from '@shapeshiftoss/market-service'
import { ParentSize } from '@visx/responsive'
import BigNumber from 'bignumber.js'
import { memo, useEffect, useState } from 'react'

import { CircularProgress } from '../CircularProgress'
import { PrimaryChart } from './PrimaryChart/PrimaryChart'

type GraphProps = {
  asset?: AssetMarketData
  timeframe: HistoryTimeframe
  setPercentChange?: (percentChange: number) => void
}

export const Graph = memo(({ asset, timeframe, setPercentChange }: GraphProps) => {
  const [data, setData] = useState<HistoryData[]>([])
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    if (asset?.name) {
      ;(async () => {
        setLoading(true)
        const data = await getAssetHistory(
          asset.network?.toLowerCase(),
          timeframe,
          asset.contractAddress
        )
        setData(data)
        setLoading(false)
        const startValue = data[0]?.price
        const endValue = data[data.length - 1]?.price
        if (setPercentChange && startValue && endValue) {
          const change = new BigNumber(endValue)
            .minus(startValue)
            .div(new BigNumber(startValue).abs())
            .times(100)
            .toNumber()
          setPercentChange(change)
        }
      })()
    }
  }, [asset, timeframe, setPercentChange])

  return (
    <ParentSize debounceTime={10}>
      {parent =>
        loading ? (
          <Center width='full' height={parent.height}>
            <CircularProgress isIndeterminate />
          </Center>
        ) : data?.length ? (
          <SlideFade in={!loading}>
            <PrimaryChart
              data={data ?? []}
              height={parent.height}
              width={parent.width}
              margin={{
                top: 16,
                right: 0,
                bottom: 46,
                left: 0
              }}
            />
          </SlideFade>
        ) : null
      }
    </ParentSize>
  )
})
