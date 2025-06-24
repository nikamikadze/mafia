import ArrowDown from '@/assets/images/arrow-down.svg'
import ArrowUp from '@/assets/images/arrow-up.svg'
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

export default function Title({
  text,
  mt,
  textColor,
  bgColor,
  size,
  collapsed,
}: {
  text: string
  mt?: number
  textColor?: string
  bgColor?: string
  size?: 'sm' | 'md' | 'lg'
  collapsed?: boolean
}) {
  return (
    <View
      style={[
        styles.container,
        mt !== undefined && { marginTop: mt },
        bgColor !== undefined && { backgroundColor: bgColor },
      ]}
    >
      <Text
        style={[
          styles.title,
          textColor !== undefined ? { color: textColor } : { color: '#CFBAB8' },
          bgColor !== undefined && { backgroundColor: bgColor },
          size === 'lg' && { fontSize: 80, paddingTop: 15, paddingBottom: 10 },
          size === 'md' && { fontSize: 70, paddingTop: 10 },
        ]}
      >
        {text}
      </Text>

      {collapsed !== undefined && (
        <View style={styles.iconContainer}>
          {collapsed ? (
            <ArrowDown width={24} height={24} fill='#CFBAB8' />
          ) : (
            <ArrowUp width={24} height={24} fill='#CFBAB8' />
          )}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    transform: [{ rotate: '-4.7deg' }],
    width: '100%',
    backgroundColor: '#010300',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  title: {
    width: '120%',
    fontFamily: 'Jomhuria',
    paddingTop: 5,
    backgroundColor: '#010300',
    textAlign: 'center',
    fontSize: 45,
    textTransform: 'uppercase',
  },
  iconContainer: {
    position: 'absolute',
    right: 20,
    top: '50%',
    transform: [{ translateY: -12 }],
  },
})
