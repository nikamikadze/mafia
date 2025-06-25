import React, { useState } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Svg, { Polygon } from 'react-native-svg'

interface ClickableProps {
  toggle?: boolean
  title?: string
  isTimeInput?: boolean
  max?: number
  mb?: number
  staticValue?: number
  currentOption?: number | number[]
  blockedCauseDead?: boolean
  blockedCauseHealed?: boolean
  blockedCauseCheckedAsMafia?: boolean
  blockedCauseCheckedAsCitizen?: boolean
  blockedCauseCheckedAsDetective?: boolean
  blockedCauseCheckedByDon?: boolean
  setCurrentOption?: (value: number) => void
  onToggle?: () => void
  onChange?: (value: number) => void
  size?: 'sm' | 'md'
  backgroundColor?: string
  availableValues?: number[]
  color?: string
}

export default function Clickable({
  toggle,
  title,
  isTimeInput,
  max,
  mb,
  staticValue,
  currentOption,
  blockedCauseDead,
  blockedCauseHealed,
  blockedCauseCheckedAsMafia,
  blockedCauseCheckedAsCitizen,
  blockedCauseCheckedAsDetective,
  blockedCauseCheckedByDon,
  setCurrentOption,
  onToggle,
  onChange,
  backgroundColor,
  size,
  availableValues,
  color,
}: ClickableProps) {
  const [internalValue, setInternalValue] = useState(
    toggle ? 'NO' : isTimeInput ? 30 : 0
  )
  const value = staticValue ?? internalValue
  const isBlocked =
    blockedCauseDead ||
    blockedCauseHealed ||
    blockedCauseCheckedAsMafia ||
    blockedCauseCheckedAsCitizen ||
    blockedCauseCheckedAsDetective ||
    blockedCauseCheckedByDon

  let blockedColor = undefined
  if (blockedCauseDead || blockedCauseHealed || blockedCauseCheckedByDon) {
    blockedColor = 'transparent'
  } else if (blockedCauseCheckedAsMafia) {
    blockedColor = 'black'
  } else if (blockedCauseCheckedAsCitizen) {
    blockedColor = 'red'
  } else if (blockedCauseCheckedAsDetective) {
    blockedColor = '#4efc03'
  }

  const handlePress = () => {
    if (staticValue !== undefined && setCurrentOption) {
      setCurrentOption(Number(value))
      return
    }

    if (toggle && onToggle) {
      setInternalValue((prev) => (prev === 'NO' ? 'YES' : 'NO'))
      onToggle()
    } else if (isTimeInput && onChange) {
      const timeSequence = [30, 45, 60, 90]
      const currentIndex = timeSequence.indexOf(internalValue as number)
      const nextIndex = (currentIndex + 1) % timeSequence.length
      setInternalValue(timeSequence[nextIndex])
      onChange(timeSequence[nextIndex])
    } else if (availableValues && availableValues.length > 0 && onChange) {
      setInternalValue((prev) => {
        const currentIndex = availableValues.indexOf(prev as number)
        const nextIndex = (currentIndex + 1) % availableValues.length
        const next = availableValues[nextIndex]
        onChange(next)
        return next
      })
    } else {
      if (onChange) {
        setInternalValue((prev) => {
          const next = (prev as number) + 1

          if (max !== undefined && next > max) {
            onChange(0)
            return 0
          }
          onChange(next)
          return next
        })
      }
    }
  }

  const titleWidth = 120
  const buttonWidth = size ? 45 : 55
  const height = 40
  const skew = 10
  const slantRatio = skew / titleWidth
  const buttonSkew = buttonWidth * slantRatio

  const renderParallelogram = (
    content: string | number,
    width: number,
    skewAmount: number,
    isLifted = false,
    isSelected = false,
    blockedColor?: string
  ) => (
    <View
      style={[
        styles.shadowBox,
        {
          width: width,
          height: height + skewAmount,
          marginLeft: isLifted ? 8 : 0,
          marginBottom: isLifted ? 11 + (mb || 0) : mb ?? 0,
        },
      ]}
    >
      <Svg
        height={height + skewAmount}
        width={width}
        style={StyleSheet.absoluteFill}
      >
        <Polygon
          points={`0,${skewAmount} ${width},0 ${width},${height} 0,${
            height + skewAmount
          }`}
          fill={blockedColor || backgroundColor || '#ffffff'}
        />

        {isSelected && (
          <Polygon
            points={`
            ${1.5},${skewAmount + 1.5}
            ${width - 1.5},${1.5}
            ${width - 1.5},${height - 1.5}
            ${1.5},${height + skewAmount - 1.5}
          `}
            fill='none'
            stroke={backgroundColor === 'red' ? 'white' : 'red'}
            strokeWidth={5}
          />
        )}
      </Svg>

      <View style={styles.innerContent}>
        <Text
          style={[
            styles.rotatedText,
            blockedCauseCheckedAsMafia && { color: 'white' },
            backgroundColor === 'black' && { color: 'white' },
            blockedColor === 'transparent' && { color: 'transparent' },
            color !== undefined && { color: color },
          ]}
        >
          {content}
        </Text>
      </View>
    </View>
  )

  return (
    <View style={[styles.outer, { marginVertical: size === 'sm' ? 0 : 4 }]}>
      {title && renderParallelogram(title.toUpperCase(), titleWidth, skew)}
      <TouchableOpacity
        onPress={isBlocked ? undefined : handlePress}
        activeOpacity={0.8}
      >
        {renderParallelogram(
          value,
          buttonWidth,
          buttonSkew,
          !!title,
          staticValue !== undefined
            ? Array.isArray(currentOption)
              ? currentOption.includes(staticValue)
              : staticValue === currentOption
            : false,
          blockedColor
        )}
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  outer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    margin: 4,
  },
  shadowBox: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
    backgroundColor: 'transparent',
  },
  innerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rotatedText: {
    fontFamily: 'Jomhuria',
    paddingTop: 5,
    fontWeight: 'bold',
    fontSize: 34,
    color: 'black',
    transform: [{ rotate: '-5deg' }],
  },
})
