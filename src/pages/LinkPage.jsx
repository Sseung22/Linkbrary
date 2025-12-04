import React, { useState, useMemo, useEffect, useCallback } from 'react';
import apiClient from '../apis/api'; // apiClient 임포트
import { useAuth } from '../contexts/AuthContext'; // AuthContext에서 useAuth 임포트
import './LinkPage.css';
// API 엔드포인트를 상수로 관리
const API_ENDPOINTS = {
  FOLDERS: '/19-10/folders',
  LINKS: '/19-10/links',
};

// 시간 차이를 계산하여 상대 시간으로 변환하는 유틸리티 함수
const timeSince = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return `${Math.floor(interval)}년 전`;
  interval = seconds / 2592000;
  if (interval > 1) return `${Math.floor(interval)}개월 전`;
  interval = seconds / 86400;
  if (interval > 1) return `${Math.floor(interval)}일 전`;
  interval = seconds / 3600;
  if (interval > 1) return `${Math.floor(interval)}시간 전`;
  interval = seconds / 60;
  if (interval > 1) return `${Math.floor(interval)}분 전`;
  return "방금 전";
};
const LinkCard = ({ link, onDelete }) => {
  const { id, url, title, description, image_source, created_at } = link; 
  // 유틸리티 함수를 사용하여 상대 시간 표시
  const timeAgo = timeSince(created_at);

  return (
    <div className="link-card">
      <img src={image_source} alt={title} className="link-card-image" />
      <div className="link-card-info">
        <p className="time-ago">{timeAgo}</p>
        <h3 className="link-card-title">{title}</h3>
        <p className="link-card-description">{description}</p>
        <p className="link-card-url">{url}</p>
      </div>
      <button onClick={() => onDelete(id)} className="delete-button">삭제</button>
    </div>
  );
};
const AddFolderModal = ({ isOpen, onClose, onAddFolder, newFolderName, setNewFolderName }) => {
  if (!isOpen) return null;

  const handleAdd = () => {
    onAddFolder();
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>폴더 추가</h2>
        <input
          type="text"
          placeholder="폴더 이름을 입력하세요"
          value={newFolderName}
          onChange={(e) => setNewFolderName(e.target.value)}
          className="modal-input"
        />
        <div className="modal-actions">
          <button onClick={onClose} className="modal-button cancel">취소</button>
          <button onClick={handleAdd} className="modal-button add">추가</button>
        </div>
      </div>
    </div>
  );
};

const LinkPage = () => {
  const { isLoggedIn } = useAuth();
  const [links, setLinks] = useState([]);
  const [folders, setFolders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFolder, setActiveFolder] = useState(null);
  const [newLink, setNewLink] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddFolderModalOpen, setIsAddFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const fetchLinksAndFolders = useCallback(async () => {
    if (!isLoggedIn) {
      setLinks([]);
      setFolders([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [foldersResponse, linksResponse] = await Promise.all([
        apiClient.get(API_ENDPOINTS.FOLDERS),
        apiClient.get(API_ENDPOINTS.LINKS),
      ]);

      const folderData = foldersResponse.data.data;
      setFolders(Array.isArray(folderData) ? folderData : []);

      const linkData = linksResponse.data.data;
      setLinks(Array.isArray(linkData) ? linkData : []);
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setError("데이터를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    fetchLinksAndFolders();
  }, [fetchLinksAndFolders]);

  const filteredLinks = useMemo(() => {
    let currentLinks = activeFolder
      ? links.filter(link => link.folder_id === activeFolder)
      : links;
    return currentLinks.filter(link =>
      link.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      link.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      link.url?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [links, searchTerm, activeFolder]);

  const handleAddLink = async () => {
    if (!newLink) return;

    if (folders.length === 0) {
      alert("링크를 추가하려면 먼저 폴더를 생성해야 합니다.");
      return;
    }

    try {
      const response = await apiClient.post(API_ENDPOINTS.LINKS, {
        url: newLink,
        folder_id: activeFolder || folders[0]?.id,
      });

      const newLinkData = response.data.data;
      if (newLinkData) {
        setLinks(prevLinks => [newLinkData, ...prevLinks]);
        setNewLink('');
      }
    } catch (err) {
      console.error("Failed to add link:", err);
      setError("링크 추가에 실패했습니다.");
    }
  };

  const handleDeleteLink = async (id) => {
    try {
      await apiClient.delete(`${API_ENDPOINTS.LINKS}/${id}`);
      setLinks(prevLinks => prevLinks.filter(link => link.id !== id));
    } catch (err) {
      console.error("Failed to delete link:", err);
      setError("링크 삭제에 실패했습니다.");
    }
  };

  const handleAddFolder = async () => {
    if (!newFolderName.trim()) {
      alert("폴더 이름을 입력해주세요.");
      return;
    }
    try {
      const response = await apiClient.post(API_ENDPOINTS.FOLDERS, {
        name: newFolderName,
      });
      const newFolder = response.data;
      if (newFolder) setFolders(prevFolders => [...prevFolders, newFolder]);
      setNewFolderName('');
      setIsAddFolderModalOpen(false);
    } catch (err) {
      console.error("Failed to add folder:", err);
      setError("폴더 추가에 실패했습니다.");
    }
  };
  
  const activeFolderName = activeFolder
    ? folders.find(f => f.id === activeFolder)?.name
    : '전체';

  if (loading) return <p>로딩 중...</p>;

  return (
    <div>
      <AddFolderModal
        isOpen={isAddFolderModalOpen}
        onClose={() => setIsAddFolderModalOpen(false)}
        onAddFolder={handleAddFolder}
        newFolderName={newFolderName}
        setNewFolderName={setNewFolderName}
      />
      <section className="hero">
        <div className="add-link-bar">
          <input
            type="text"
            placeholder="링크를 추가해 보세요"
            value={newLink}
            onChange={(e) => setNewLink(e.target.value)}
          />
          <button onClick={handleAddLink} disabled={!isLoggedIn}>추가하기</button>
        </div>
        {!isLoggedIn && <p className="add-link-login-message">링크를 추가하려면 로그인해주세요.</p>}
      </section>

      <main>
        {error && <p className="error-message">{error}</p>}
        <div className="search-bar">
          <input
            type="text"
            placeholder="링크를 검색해 보세요"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filters">
          <button onClick={() => setActiveFolder(null)} className={!activeFolder ? 'active' : ''}>전체</button>
          {folders.map(folder => (
            <button
              key={folder.id}
              onClick={() => setActiveFolder(folder.id)}
              className={activeFolder === folder.id ? 'active' : ''}
            >
              {folder.name}
            </button>
          ))}
        </div>
        <div className="folder-actions">
          <h2>{activeFolderName}</h2>
          <div>
            <button onClick={() => setIsAddFolderModalOpen(true)}>폴더 추가하기</button>
            <button>공유</button>
            <button>삭제</button>
          </div>
        </div>

        <div className="link-grid">
          {filteredLinks.length === 0 && !loading && !error && <p>표시할 링크가 없습니다.</p>}
          {filteredLinks.map(link => (
            <LinkCard key={link.id} link={link} onDelete={handleDeleteLink} />
          ))}
        </div>
      </main>
    </div>
  );
};

export default LinkPage;
