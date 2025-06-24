import React from 'react'
import { StyleSheet, Text, TouchableOpacity } from 'react-native'

export default function MainButton({
  text,
  color,
  bgColor,
  size,
  onClick,
  shadow,
  mt,
}: {
  text: string
  color: string
  bgColor: string
  size: 'sm' | 'md' | 'lg'
  onClick: () => void
  shadow?: {
    shadowColor: string
    shadowOffset: { width: number; height: number }
    shadowOpacity?: number
    shadowRadius?: number
  }
  mt?: number
}) {
  const getWidth = () => {
    if (size === 'lg') return '100%'
    if (size === 'md') return '50%'
    return '25%'
  }

  const getFontSize = () => {
    if (size === 'lg') return 70
    if (size === 'md') return 60
    return 45
  }

  const getAlignment = () => {
    if (size === 'md') return 'center'
    return 'flex-start'
  }

  return (
    <TouchableOpacity
      onPress={() => onClick()}
      style={[
        styles.container,
        {
          width: getWidth(),
          alignSelf: getAlignment(),
        },
        shadow?.shadowColor !== undefined && {
          shadowColor: shadow.shadowColor,
        },
        shadow?.shadowOffset !== undefined && {
          shadowOffset: shadow.shadowOffset,
        },
        shadow?.shadowOpacity !== undefined && {
          shadowOpacity: shadow.shadowOpacity,
        },
        shadow?.shadowRadius !== undefined && {
          shadowRadius: shadow.shadowRadius,
        },
        mt !== undefined && { marginTop: mt },
      ]}
    >
      <Text
        style={[
          styles.title,
          {
            color: color,
            backgroundColor: bgColor,
            fontSize: getFontSize(),
          },
        ]}
      >
        {text}
      </Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    transform: [{ rotate: '-5deg' }],
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    width: '120%',
    fontFamily: 'Jomhuria',
    textAlign: 'center',
    textTransform: 'uppercase',
    paddingTop: 10,
  },
})
