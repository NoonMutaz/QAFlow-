'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useProjects } from "../../context/ProjectContext";
import InviteModal from "./InviteModal";
import RemoveModal from './RemoveModal';
import { useQueueContext } from "../../context/QueueContext";
import MyProjectHeader from './MyProjectHeader';
import ProjectCard from './ProjectCard';
import CreateProjectForm from './CreateProjectForm';
interface Member {
  id: string;       
  userId: string;
  email: string;
  role: 'owner' | 'member' | 'viewer';
  joinedAt: string;
}
export default function MyProjects() {
  const router = useRouter();
  const { projects, deleteProject, handleOpenProject, fetchProjects, isLoading, updateProject } = useProjects();
  const { queue, fetchBugs } = useQueueContext();
  
  const [openModalId, setOpenModalId] = useState<number | null>(null);
  const [inviteModal, setInviteModal] = useState<number | null>(null);
  const [settingsModalProjectId, setSettingsModalProjectId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [projectForm, setProjectForm] = useState({ name: '', description: '', type: '' });
  const [projectErrors, setProjectErrors] = useState<{ [key: string]: string }>({});
  const [isProjectSubmitting, setIsProjectSubmitting] = useState(false);

const [projectMembers, setProjectMembers] = useState<Member[]>([]);
const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);
const [membersLoading, setMembersLoading] = useState(false);


 
  const projectTypes = ["QA Dashboard", "Bug Tracking", "Test Management", "Performance Testing", "Web App", "Mobile App", "API Project"];

  //  NEW: Fetch project members function
  const fetchProjectMembers = async (projectId: number) => {
    if (!projectId) return;
    
    setMembersLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/projects/${projectId}/members`, {
        headers: { 
          Authorization: `Bearer ${token}` 
        },
      });
      
      if (res.ok) {
        const members: Member[] = await res.json();
        setProjectMembers(members);
      } else {
        console.error('Failed to fetch members:', await res.text());
      }
    } catch (e) {
      console.error('Network error fetching members:', e);
    } finally {
      setMembersLoading(false);
    }
  };

  // HELPER: Check if user is owner
  const isOwner = (projectRole?: string) => projectRole === 'owner';

 
  const filteredProjects = projects.filter(project =>
    project.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.type?.toLowerCase().includes(searchTerm.toLowerCase())
  );


//   ADD: Load members when invite modal opens (after existing useEffects)
useEffect(() => {
  if (inviteModal !== null) {
    fetchProjectMembers(inviteModal);
  } else {
    setProjectMembers([]); // Clear when modal closes
  }
}, [inviteModal]);
const handleUpdateMember = async (memberId: string, role: Member['role']) => {
  try {
    const token = localStorage.getItem('token');
    if (!inviteModal) return;
    
    setRemovingMemberId(memberId); //   Use string directly, no Number()
    
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/projects/${inviteModal}/members/${memberId}`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json', 
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify({ role }),
    });
    
    if (!res.ok) {
      const text = await res.text();
      alert(`❌ Update failed: ${text}`);
      return;
    }
    
    alert('  Role updated!');
    await fetchProjectMembers(inviteModal);
  } catch (e) {
    alert('❌ Network error');
  } finally {
    setRemovingMemberId(null);
    
  }
};

//   Handle member removal
const handleRemoveMember = async (memberId: string) => {
  try {
    const token = localStorage.getItem('token');
    if (!inviteModal) return;
    
    //  SELF-PROTECTION
    const currentUserId = localStorage.getItem('userId');
    if (currentUserId === memberId) {
      alert('⚠️ Cannot remove yourself');
      return;
    }
    
    setRemovingMemberId(memberId); //   Use string directly, no Number()
    
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/projects/${inviteModal}/members/${memberId}`, {
      method: 'DELETE',
      headers: { 
        Authorization: `Bearer ${token}` 
      },
    });
    
    if (!res.ok) {
      const text = await res.text();
      alert(`❌ Remove failed: ${text}`);
      return;
    }
    
    alert('✅ Member removed!');
    await fetchProjectMembers(inviteModal);
  } catch (e) {
    alert('❌ Network error');
  } finally {
    setRemovingMemberId(null);
  }
};


  
  // useEffect(() => { fetchProjects(); }, []);
  
  useEffect(() => {
    if (projects.length > 0) {
      projects.forEach(project => fetchBugs(project.id.toString()));
    }
  }, [projects]);

  const getProjectStatus = (projectId: number) => {
    const bugs = queue?.[projectId] || [];
    const total = bugs.length;
    const fixed = bugs.filter((b: any) => b.status === 'fixed').length;
    if (total === 0) return { label: 'New', color: 'emerald' };
    if (fixed === total) return { label: 'All Fixed ✅', color: 'green' };
    return { label: `${total} Active`, color: total > 5 ? 'amber' : 'blue' };
  };

  const openProjectSettings = (project: any) => {
    if (!isOwner(project.role)) {
      alert('⚠️ Only owners can edit projects');
      return;
    }
    setSettingsModalProjectId(project.id);
    setProjectForm({ 
      name: project.name || '', 
      description: project.description || '', 
      type: project.type || 'QA Dashboard' 
    });
    setProjectErrors({});
  };

  const handleDeleteClick = (project: any) => {
    if (!isOwner(project.role)) {
      alert('⚠️ Only owners can delete projects');
      return;
    }
    setOpenModalId(project.id);
  };

  const handleInviteClick = (project: any) => {
    if (!isOwner(project.role)) {
      alert('⚠️ Only owners can invite members');
      return;
    }
    setInviteModal(project.id);
  };

  const validateProjectForm = () => {
    const errs: { [key: string]: string } = {};
    if (!projectForm.name.trim()) errs.name = "Project name is required";
    else if (projectForm.name.length < 3) errs.name = "At least 3 characters";
    if (projectForm.description?.length! > 100) errs.description = "Max 100 characters";
    setProjectErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleUpdateProject = async () => {
    if (!validateProjectForm()) return;
    setIsProjectSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token');
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/projects/${settingsModalProjectId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json', 
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(projectForm),
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || `HTTP ${res.status}`);
      }
      
      const updated = await res.json();
      updateProject(updated);
      setSettingsModalProjectId(null);
      alert('✅ Project updated!');
    } catch (e: any) {
      console.error('Update failed:', e);
      setProjectErrors({ submit: e.message || 'Failed to update project' });
    } finally {
      setIsProjectSubmitting(false);
    }
  };

  const currentProject = projects.find(p => p.id === settingsModalProjectId);
  const anyModalOpen = openModalId !== null || inviteModal !== null || settingsModalProjectId !== null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/60">
      {/* Backdrop */}
      {anyModalOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
          onClick={() => { 
            setOpenModalId(null); 
            setInviteModal(null); 
            setSettingsModalProjectId(null); 
          }}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
       <MyProjectHeader  isLoading={isLoading} filteredProjects={filteredProjects}   projects={projects}  searchTerm={searchTerm}  setSearchTerm={setSearchTerm}  />

        {/* Projects Grid */}
      <ProjectCard    handleDeleteClick={handleDeleteClick} handleInviteClick={handleInviteClick} handleOpenProject={handleOpenProject} openProjectSettings={openProjectSettings} isLoading={isLoading} filteredProjects={filteredProjects} searchTerm={searchTerm} setSearchTerm={setSearchTerm} projects={projects}   getProjectStatus={getProjectStatus} queue={queue} isOwner={isOwner}/>
</div>
      {/* Delete Modal - Owner Only */}
      {openModalId !== null && projects.find(p => p.id === openModalId) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-auto">
          <RemoveModal
            removeQueue={deleteProject}
            customer={projects.find(p => p.id === openModalId)!}
            onClose={() => setOpenModalId(null)}
          />
        </div>
      )}

      {/* Invite Modal - Owner Only */}
     {/*   InviteModal */}
{inviteModal !== null && projects.find(p => p.id === inviteModal) && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-auto">
    <InviteModal
      isOpen={true}
       removingMemberId={removingMemberId?.toString() || null}
        onRemoveMember={handleRemoveMember}
       
      customer={{ 
        id: inviteModal.toString(), //  Convert number to string
        name: projects.find(p => p.id === inviteModal)?.name || 'Project'
      }}
      members={projectMembers} //   Works now with proper typing
      onClose={() => setInviteModal(null)}
      onInvite={async (email) => { //  Fixed prop name
        const trimmed = email?.trim();
        if (!trimmed?.includes('@')) { 
          alert('⚠️ Invalid email'); 
          return; 
        }
        try {
          const token = localStorage.getItem('token');
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/projects/${inviteModal}/invite`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json', 
              Authorization: `Bearer ${token}` 
            },
            body: JSON.stringify({ email: trimmed }),
          });
          if (!res.ok) {
            const text = await res.text();
            alert(text.includes('already') ? 'ℹ️ Already invited' : `❌ ${text}`);
            return;
          }
          alert('✅ Invitation sent!');
          setInviteModal(null);
          fetchProjects();
        } catch (e) { 
          alert('❌ Network error'); 
        }
      }}
      onUpdateMember={handleUpdateMember} 
      onRemoveMember={handleRemoveMember}  
    />
  </div>
)}

      {/* Edit Project Modal - Owner Only */}
      <CreateProjectForm handleUpdateProject={handleUpdateProject} projectTypes={projectTypes} isProjectSubmitting={isProjectSubmitting} projectErrors={projectErrors} setSettingsModalProjectId={setSettingsModalProjectId}   currentProject={currentProject} isOwner={isOwner}  setSettingsModalProjectId={setSettingsModalProjectId} projectForm={projectForm}setProjectForm={setProjectForm} />
    </div>
  );
}