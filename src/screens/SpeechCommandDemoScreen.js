import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import Animated, { FadeInDown } from 'react-native-reanimated';

import CustomText from '../components/CustomText';
import InnerScreenHeader from '../components/InnerScreenHeader';
import VoiceInputButton from '../components/VoiceInputButton';
import { useLanguage } from '../context/LanguageContext';
import globalStyles from '../styles/globalStyles';
import { color } from '../styles/theme';

const DUMMY_COMMAND_RESPONSES = {
  bookings: {
    title: 'Booking Requests',
    summary: '4 nearby requests found',
    items: [
      {
        id: 'BK-1024',
        title: 'Tractor for field ploughing',
        subtitle: 'Kandukur, Nellore',
        meta: 'Today, 3:30 PM',
        amount: '₹2,400',
        status: 'New',
      },
      {
        id: 'BK-1025',
        title: 'Rotavator service',
        subtitle: 'Kovur, Nellore',
        meta: 'Tomorrow, 8:00 AM',
        amount: '₹1,800',
        status: 'Pending',
      },
      {
        id: 'BK-1026',
        title: 'Harvester booking',
        subtitle: 'Atmakur, Nellore',
        meta: '12 Jun, 6:00 AM',
        amount: '₹5,500',
        status: 'High value',
      },
      {
        id: 'BK-1027',
        title: 'Trolley transport',
        subtitle: 'Buchi, Nellore',
        meta: '13 Jun, 10:15 AM',
        amount: '₹1,200',
        status: 'New',
      },
    ],
  },
  earnings: {
    title: 'Recent Earnings',
    summary: '3 payments in the last 7 days',
    items: [
      {
        id: 'PAY-7781',
        title: 'Completed ploughing job',
        subtitle: 'Paid to HDFC account',
        meta: 'Today',
        amount: '₹2,250',
        status: 'Paid',
      },
      {
        id: 'PAY-7775',
        title: 'Rotavator rental',
        subtitle: 'Settlement processing',
        meta: 'Yesterday',
        amount: '₹1,650',
        status: 'Processing',
      },
      {
        id: 'PAY-7768',
        title: 'Harvester service',
        subtitle: 'Paid to HDFC account',
        meta: '05 Jun',
        amount: '₹4,900',
        status: 'Paid',
      },
    ],
  },
  vehicles: {
    title: 'Vehicle Status',
    summary: '3 registered vehicles found',
    items: [
      {
        id: 'VH-201',
        title: 'Mahindra 575 DI',
        subtitle: 'AP 12 AB 3456',
        meta: 'Tractor',
        amount: 'Online',
        status: 'Ready',
      },
      {
        id: 'VH-202',
        title: 'Rotavator attachment',
        subtitle: 'Linked to Mahindra 575 DI',
        meta: 'Equipment',
        amount: 'Available',
        status: 'Ready',
      },
      {
        id: 'VH-203',
        title: 'Trolley',
        subtitle: 'AP 12 TR 9087',
        meta: 'Transport',
        amount: 'Offline',
        status: 'Needs update',
      },
    ],
  },
};

const COMMANDS = [
  {
    key: 'bookings',
    labels: {
      en: 'Show bookings',
      hi: 'बुकिंग दिखाओ',
      te: 'బుకింగ్స్ చూపించు',
    },
    icon: 'calendar-check-outline',
    keywords: [
      'booking',
      'bookings',
      'request',
      'requests',
      'jobs',
      'job',
      'बुकिंग',
      'बुकिंग्स',
      'अनुरोध',
      'रिक्वेस्ट',
      'काम',
      'జాబ్',
      'జాబ్స్',
      'బుకింగ్',
      'బుకింగ్స్',
      'రిక్వెస్ట్',
      'రిక్వెస్టులు',
      'పని',
      'పనులు',
    ],
  },
  {
    key: 'earnings',
    labels: {
      en: 'Show earnings',
      hi: 'कमाई दिखाओ',
      te: 'ఆదాయం చూపించు',
    },
    icon: 'cash-multiple',
    keywords: [
      'earning',
      'earnings',
      'payment',
      'payments',
      'income',
      'money',
      'कमाई',
      'आमदनी',
      'पेमेंट',
      'भुगतान',
      'पैसा',
      'పేమెంట్',
      'పేమెంట్స్',
      'చెల్లింపు',
      'చెల్లింపులు',
      'ఆదాయం',
      'సంపాదన',
      'డబ్బు',
    ],
  },
  {
    key: 'vehicles',
    labels: {
      en: 'Show vehicles',
      hi: 'वाहन दिखाओ',
      te: 'వాహనాలు చూపించు',
    },
    icon: 'tractor',
    keywords: [
      'vehicle',
      'vehicles',
      'tractor',
      'equipment',
      'machine',
      'वाहन',
      'गाड़ी',
      'गाडियां',
      'ट्रैक्टर',
      'मशीन',
      'उपकरण',
      'వాహనం',
      'వాహనాలు',
      'ట్రాక్టర్',
      'యంత్రం',
      'పరికరం',
      'పరికరాలు',
    ],
  },
];

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function resolveCommandKey(commandText) {
  const normalized = commandText.toLowerCase();
  return COMMANDS.find((command) =>
    command.keywords.some((keyword) => normalized.includes(keyword))
  )?.key ?? 'bookings';
}

function getCommandLabel(command, locale) {
  return command.labels[locale] ?? command.labels.en;
}

async function fetchDummyCommandData(commandText) {
  const commandKey = resolveCommandKey(commandText);
  await wait(700);

  return {
    commandKey,
    commandText,
    requestedAt: new Date().toISOString(),
    data: DUMMY_COMMAND_RESPONSES[commandKey],
  };
}

function CommandChip({ command, label, selected, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.commandChip, selected && styles.commandChipActive]}
      onPress={onPress}
      activeOpacity={0.78}
    >
      <MaterialCommunityIcons
        name={command.icon}
        size={16}
        color={selected ? color.WHITE : color.GREEN}
      />
      <CustomText style={[styles.commandChipText, selected && styles.commandChipTextActive]}>
        {label}
      </CustomText>
    </TouchableOpacity>
  );
}

function ResultItem({ item, index }) {
  return (
    <Animated.View
      entering={FadeInDown.delay(index * 40).duration(260)}
      style={styles.resultItem}
    >
      <View style={styles.resultIconBox}>
        <Ionicons name="document-text-outline" size={18} color={color.GREEN} />
      </View>
      <View style={styles.resultBody}>
        <View style={styles.resultTitleRow}>
          <CustomText style={styles.resultTitle}>{item.title}</CustomText>
          <CustomText style={styles.resultAmount}>{item.amount}</CustomText>
        </View>
        <CustomText style={styles.resultSub}>{item.subtitle}</CustomText>
        <View style={styles.resultMetaRow}>
          <CustomText style={styles.resultMeta}>{item.meta}</CustomText>
          <View style={styles.statusPill}>
            <CustomText style={styles.statusText}>{item.status}</CustomText>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

export default function SpeechCommandDemoScreen({ navigation }) {
  const { locale } = useLanguage();
  const [transcript, setTranscript] = useState('');
  const [partialTranscript, setPartialTranscript] = useState('');
  const [selectedCommand, setSelectedCommand] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const displayText = partialTranscript || transcript || 'Tap mic and speak';

  const selectedCommandMeta = useMemo(
    () => COMMANDS.find((command) => command.key === selectedCommand),
    [selectedCommand]
  );

  const runCommand = async (commandText) => {
    const cleanText = commandText.trim();
    if (!cleanText || loading) return;

    setPartialTranscript('');
    setTranscript(cleanText);
    setSelectedCommand(resolveCommandKey(cleanText));
    setLoading(true);

    try {
      const apiResponse = await fetchDummyCommandData(cleanText);
      setSelectedCommand(apiResponse.commandKey);
      setResponse(apiResponse);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickCommand = (command) => {
    runCommand(getCommandLabel(command, locale));
  };

  const renderHeader = () => (
    <View style={styles.content}>
      <Animated.View entering={FadeInDown.duration(350)} style={styles.voicePanel}>
        <View style={styles.voiceHeader}>
          <View style={styles.voiceIconBox}>
            <Ionicons name="mic-outline" size={22} color={color.GREEN} />
          </View>
          <View style={styles.voiceTextBlock}>
            <CustomText style={styles.panelTitle}>Speech Command Demo</CustomText>
            <CustomText style={styles.panelSub}>{displayText}</CustomText>
          </View>
          <VoiceInputButton
            size="lg"
            onPartialResult={setPartialTranscript}
            onResult={runCommand}
            disabled={loading}
          />
        </View>

        <View style={styles.commandRow}>
          {COMMANDS.map((command) => (
            <CommandChip
              key={command.key}
              command={command}
              label={getCommandLabel(command, locale)}
              selected={selectedCommand === command.key}
              onPress={() => handleQuickCommand(command)}
            />
          ))}
        </View>
      </Animated.View>

      {loading && (
        <View style={styles.loadingCard}>
          <ActivityIndicator size="small" color={color.GREEN} />
          <CustomText style={styles.loadingText}>Fetching sample data</CustomText>
        </View>
      )}

      {response && !loading && (
        <Animated.View entering={FadeInDown.duration(300)} style={styles.responseHeader}>
          <View>
            <CustomText style={styles.responseTitle}>{response.data.title}</CustomText>
            <CustomText style={styles.responseSub}>{response.data.summary}</CustomText>
          </View>
          {selectedCommandMeta ? (
            <View style={styles.responseBadge}>
              <MaterialCommunityIcons
                name={selectedCommandMeta.icon}
                size={14}
                color={color.GREEN}
              />
              <CustomText style={styles.responseBadgeText}>{selectedCommandMeta.key}</CustomText>
            </View>
          ) : null}
        </Animated.View>
      )}

      {!response && !loading && (
        <View style={styles.emptyState}>
          <Ionicons name="list-outline" size={34} color={color.TEXT_MUTED} />
          <CustomText style={styles.emptyTitle}>No data loaded</CustomText>
          <CustomText style={styles.emptySub}>Try one of the sample commands above.</CustomText>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <InnerScreenHeader navigation={navigation} title="Speech Demo" />

      <FlatList
        data={response?.data.items ?? []}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => <ResultItem item={item} index={index} />}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: color.SURFACE,
  },

  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 10,
  },

  content: {
    gap: 14,
  },

  voicePanel: {
    backgroundColor: color.WHITE,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: color.BORDER_LIGHT,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },

  voiceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  voiceIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: color.GREEN_BG,
    justifyContent: 'center',
    alignItems: 'center',
  },

  voiceTextBlock: {
    flex: 1,
    gap: 3,
  },

  panelTitle: {
    ...globalStyles.f14Bold,
    color: color.TEXT_MAIN,
  },

  panelSub: {
    ...globalStyles.f12Regular,
    color: color.TEXT_MUTED,
    lineHeight: 18,
  },

  commandRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  commandChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: color.BORDER_GREEN,
    backgroundColor: color.GREEN_BG,
  },

  commandChipActive: {
    backgroundColor: color.GREEN,
    borderColor: color.GREEN,
  },

  commandChipText: {
    ...globalStyles.f10Bold,
    color: color.GREEN,
  },

  commandChipTextActive: {
    color: color.WHITE,
  },

  loadingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: color.WHITE,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: color.BORDER_LIGHT,
  },

  loadingText: {
    ...globalStyles.f12Bold,
    color: color.TEXT_SUB,
  },

  responseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 2,
  },

  responseTitle: {
    ...globalStyles.f16Bold,
    color: color.TEXT_MAIN,
  },

  responseSub: {
    ...globalStyles.f12Regular,
    color: color.TEXT_MUTED,
    marginTop: 2,
  },

  responseBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: color.GREEN_BG,
    borderRadius: 99,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  responseBadgeText: {
    ...globalStyles.f10Bold,
    color: color.GREEN,
    textTransform: 'capitalize',
  },

  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 44,
    gap: 8,
  },

  emptyTitle: {
    ...globalStyles.f14Bold,
    color: color.TEXT_MAIN,
  },

  emptySub: {
    ...globalStyles.f12Regular,
    color: color.TEXT_MUTED,
    textAlign: 'center',
  },

  resultItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: color.WHITE,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: color.BORDER_LIGHT,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },

  resultIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: color.GREEN_BG,
    justifyContent: 'center',
    alignItems: 'center',
  },

  resultBody: {
    flex: 1,
    gap: 5,
  },

  resultTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },

  resultTitle: {
    ...globalStyles.f12Bold,
    color: color.TEXT_MAIN,
    flex: 1,
  },

  resultAmount: {
    ...globalStyles.f12Bold,
    color: color.GREEN,
  },

  resultSub: {
    ...globalStyles.f12Regular,
    color: color.TEXT_SUB,
  },

  resultMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },

  resultMeta: {
    ...globalStyles.f10Regular,
    color: color.TEXT_MUTED,
    flex: 1,
  },

  statusPill: {
    backgroundColor: color.SURFACE_LOW,
    borderRadius: 99,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },

  statusText: {
    ...globalStyles.f10Bold,
    color: color.TEXT_SUB,
  },
});
