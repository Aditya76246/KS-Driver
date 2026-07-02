import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

import CustomText from '../../components/CustomText';
import globalStyles from '../../styles/globalStyles';
import { color } from '../../styles/theme';

const MY_JOBS = [
  {
    id: 'j1',
    farmerName: 'Suresh Reddy',
    task: 'Paddy Transplanting',
    location: 'Nellore',
    date: 'Today, 7:00 AM',
    pay: '₹600',
    status: 'ongoing',
  },
  {
    id: 'j2',
    farmerName: 'Venkata Rao',
    task: 'Manual Harvesting',
    location: 'Ongole',
    date: 'Yesterday, 6:00 AM',
    pay: '₹800',
    status: 'completed',
  },
  {
    id: 'j3',
    farmerName: 'Krishnaiah',
    task: 'Weed Removal',
    location: 'Kandukur',
    date: 'Oct 23, 6:30 AM',
    pay: '₹500',
    status: 'applied',
  },
];

const STATUS_CONFIG = {
  ongoing:   { label: 'Ongoing',   bg: color.GREEN_BG, textColor: color.GREEN   },
  completed: { label: 'Completed', bg: '#E3F2FD',      textColor: '#1565C0'    },
  applied:   { label: 'Applied',   bg: '#FFF3E0',      textColor: '#E65100'    },
};

function JobCard({ job, onMarkDone, delay = 0 }) {
  const sc = STATUS_CONFIG[job.status] || STATUS_CONFIG.applied;
  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(400)} style={styles.jobCard}>
      <View style={styles.jobHeader}>
        <View style={{ flex: 1 }}>
          <CustomText style={styles.jobTask}>{job.task}</CustomText>
          <CustomText style={styles.jobFarmer}>{job.farmerName} · {job.location}</CustomText>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
          <CustomText style={[styles.statusText, { color: sc.textColor }]}>{sc.label}</CustomText>
        </View>
      </View>

      <View style={styles.jobMeta}>
        <View style={styles.metaItem}>
          <Ionicons name="time-outline" size={14} color={color.TEXT_MUTED} />
          <CustomText style={styles.metaText}>{job.date}</CustomText>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="cash-outline" size={14} color={color.GREEN} />
          <CustomText style={[styles.metaText, { color: color.GREEN }]}>{job.pay}</CustomText>
        </View>
      </View>

      {job.status === 'ongoing' && (
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => onMarkDone(job.id)}
          activeOpacity={0.8}
        >
          <CustomText style={styles.actionBtnText}>Mark as Completed</CustomText>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}

export default function GigJobsScreen() {
  const [jobs, setJobs] = useState(MY_JOBS);

  const handleMarkDone = (id) => {
    setJobs((prev) =>
      prev.map((j) => (j.id === id ? { ...j, status: 'completed' } : j))
    );
  };

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {jobs.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="briefcase-outline" size={48} color={color.BORDER} />
            <CustomText style={styles.emptyText}>No jobs yet</CustomText>
          </View>
        ) : (
          jobs.map((j, i) => (
            <JobCard
              key={j.id}
              job={j}
              onMarkDone={handleMarkDone}
              delay={i * 60}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.SURFACE },
  scrollContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32, gap: 12 },

  jobCard: {
    backgroundColor: color.WHITE,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: color.BORDER_LIGHT,
    elevation: 2,
    gap: 10,
  },
  jobHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  jobTask: { ...globalStyles.f14Bold, color: color.TEXT_MAIN },
  jobFarmer: { ...globalStyles.f12Regular, color: color.TEXT_SUB, marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 30 },
  statusText: { ...globalStyles.f10Bold },

  jobMeta: { flexDirection: 'row', gap: 16 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: { ...globalStyles.f12Regular, color: color.TEXT_MUTED },

  actionBtn: {
    backgroundColor: color.GREEN,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  actionBtnText: { ...globalStyles.f12Bold, color: color.WHITE },

  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    gap: 12,
  },
  emptyText: { ...globalStyles.f12Regular, color: color.TEXT_MUTED },
});
