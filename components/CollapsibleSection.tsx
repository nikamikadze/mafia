import React, { useState } from 'react'
import {
  LayoutAnimation,
  Platform,
  StyleSheet,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native'
import Title from './Title'

interface Props {
  title: string
  children: React.ReactNode
}

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true)
}

export default function CollapsibleSection({ title, children }: Props) {
  const [isOpen, setIsOpen] = useState(true)

  const toggleSection = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setIsOpen((prev) => !prev)
  }

  return (
    <View>
      <TouchableOpacity onPress={toggleSection}>
        <Title text={title} mt={15} textColor='#A4161A' collapsed={!isOpen} />
      </TouchableOpacity>
      {isOpen && <View style={styles.content}>{children}</View>}
    </View>
  )
}

const styles = StyleSheet.create({
  content: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
})
