import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type {
  ResumeData,
  ResumeSectionId,
  ExperienceEntry,
  EducationEntry,
  ProjectEntry,
  Skills,
  About,
} from '../types/resume'
import {
  DEFAULT_RESUME,
  createExperienceEntry,
  createEducationEntry,
  createProjectEntry,
} from '../types/resume'

interface ResumeContextValue {
  resume: ResumeData
  updateAbout: (about: Partial<About>) => void
  addExperience: () => void
  updateExperience: (id: string, data: Partial<ExperienceEntry>) => void
  removeExperience: (id: string) => void
  addEducation: () => void
  updateEducation: (id: string, data: Partial<EducationEntry>) => void
  removeEducation: (id: string) => void
  updateSkills: (skills: Partial<Skills>) => void
  addProject: () => void
  updateProject: (id: string, data: Partial<ProjectEntry>) => void
  removeProject: (id: string) => void
  setResume: (resume: ResumeData) => void
}

const ResumeContext = createContext<ResumeContextValue | null>(null)

export function ResumeProvider({ children }: { children: React.ReactNode }) {
  const [resume, setResumeState] = useState<ResumeData>(() => ({ ...DEFAULT_RESUME }))

  const updateAbout = useCallback((about: Partial<About>) => {
    setResumeState((prev) => ({
      ...prev,
      about: { ...prev.about, ...about },
    }))
  }, [])

  const addExperience = useCallback(() => {
    setResumeState((prev) => ({
      ...prev,
      experience: [...prev.experience, createExperienceEntry()],
    }))
  }, [])

  const updateExperience = useCallback((id: string, data: Partial<ExperienceEntry>) => {
    setResumeState((prev) => ({
      ...prev,
      experience: prev.experience.map((e) => (e.id === id ? { ...e, ...data } : e)),
    }))
  }, [])

  const removeExperience = useCallback((id: string) => {
    setResumeState((prev) => ({
      ...prev,
      experience: prev.experience.filter((e) => e.id !== id),
    }))
  }, [])

  const addEducation = useCallback(() => {
    setResumeState((prev) => ({
      ...prev,
      education: [...prev.education, createEducationEntry()],
    }))
  }, [])

  const updateEducation = useCallback((id: string, data: Partial<EducationEntry>) => {
    setResumeState((prev) => ({
      ...prev,
      education: prev.education.map((e) => (e.id === id ? { ...e, ...data } : e)),
    }))
  }, [])

  const removeEducation = useCallback((id: string) => {
    setResumeState((prev) => ({
      ...prev,
      education: prev.education.filter((e) => e.id !== id),
    }))
  }, [])

  const updateSkills = useCallback((skills: Partial<Skills>) => {
    setResumeState((prev) => ({
      ...prev,
      skills: { ...prev.skills, ...skills },
    }))
  }, [])

  const addProject = useCallback(() => {
    setResumeState((prev) => ({
      ...prev,
      projects: [...prev.projects, createProjectEntry()],
    }))
  }, [])

  const updateProject = useCallback((id: string, data: Partial<ProjectEntry>) => {
    setResumeState((prev) => ({
      ...prev,
      projects: prev.projects.map((p) => (p.id === id ? { ...p, ...data } : p)),
    }))
  }, [])

  const removeProject = useCallback((id: string) => {
    setResumeState((prev) => ({
      ...prev,
      projects: prev.projects.filter((p) => p.id !== id),
    }))
  }, [])

  const setResume = useCallback((next: ResumeData) => {
    setResumeState(next)
  }, [])

  const value = useMemo<ResumeContextValue>(
    () => ({
      resume,
      updateAbout,
      addExperience,
      updateExperience,
      removeExperience,
      addEducation,
      updateEducation,
      removeEducation,
      updateSkills,
      addProject,
      updateProject,
      removeProject,
      setResume,
    }),
    [
      resume,
      updateAbout,
      addExperience,
      updateExperience,
      removeExperience,
      addEducation,
      updateEducation,
      removeEducation,
      updateSkills,
      addProject,
      updateProject,
      removeProject,
      setResume,
    ]
  )

  return <ResumeContext.Provider value={value}>{children}</ResumeContext.Provider>
}

export function useResume() {
  const ctx = useContext(ResumeContext)
  if (!ctx) throw new Error('useResume must be used within ResumeProvider')
  return ctx
}

// Re-export for flow logic (section order is in types)
export type { ResumeSectionId }
