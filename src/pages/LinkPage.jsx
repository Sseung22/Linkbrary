import React, { useState, useMemo, useEffect } from 'react';
import apiClient from '../apis/api'; // apiClient 임포트
import { useAuth } from '../contexts/AuthContext'; // AuthContext에서 useAuth 임포트
import './LinkPage.css';

const LinkCard = ({ link, onDelete }) => {
  const { id, url, title, description, image_source, created_at } = link; // created_at 구조 분해 할당
  const timeAgp = new Date(created_at).toLocaleDateString(); // 날짜 형식 지정

  return (
    <div className="link-card">
      <img src={image_source} alt={title} className="link-card-image" />
      <div className="link-card-info">
        <p className="time-ago">{timeAgp}</p>
        <h3 className="link-card-title">{title}</h3>
        <p className="link-card-description">{description}</p>
        <p className="link-card-url">{url}</p>
      </div>
      <button onClick={() => onDelete(id)} className="delete-button">삭제</button>
    </div>
  );
};

const LinkPage = () => {
  const { isLoggedIn } = useAuth(); // 로그인 상태 확인
  const [links, setLinks] = useState([]);
  const [folders, setFolders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFolder, setActiveFolder] = useState(null);
  const [newLink, setNewLink] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLinksAndFolders = async () => {
    setLoading(true);
    setError(null);

    if (!isLoggedIn) {
      setLinks([]);
      setFolders([]);
      setLoading(false);
      return;
    }

    try {
      const [foldersResponse, linksResponse] = await Promise.all([
        apiClient.get('/folders'),
        apiClient.get('/links')
      ]);
      setFolders(foldersResponse.data.data); // 데이터가 .data.data에 있다고 가정
      setLinks(linksResponse.data.data);   // 데이터가 .data.data에 있다고 가정
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setError("데이터를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLinksAndFolders();
  }, [isLoggedIn]); // 로그인 상태 변경 시 다시 가져오기

  const filteredLinks = useMemo(() => {
    let currentLinks = activeFolder
      ? links.filter(link => link.folder_id === activeFolder)
      : links;

    return currentLinks.filter(link =>
      link.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      link.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      link.url.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [links, searchTerm, activeFolder]);

  const handleAddLink = async () => {
    if (!newLink) return;
    try {
      const response = await apiClient.post('/links', {
        url: newLink,
        folderId: activeFolder || folders[0]?.id // 선택된 폴더가 없으면 첫 번째 폴더로 기본 설정
      });
      setLinks(prevLinks => [response.data.data, ...prevLinks]); // 새 링크 데이터가 response.data.data에 있다고 가정
      setNewLink('');
      // 필요에 따라 모든 데이터를 다시 가져와 개수 등을 업데이트
      // fetchLinksAndFolders(); 
    } catch (err) {
      console.error("Failed to add link:", err);
      setError("링크 추가에 실패했습니다.");
    }
  };

  const handleDeleteLink = async (id) => {
    try {
      await apiClient.delete(`/links/${id}`);
      setLinks(prevLinks => prevLinks.filter(link => link.id !== id));
    } catch (err) {
      console.error("Failed to delete link:", err);
      setError("링크 삭제에 실패했습니다.");
    }
  };
  
  const activeFolderName = activeFolder 
    ? folders.find(f => f.id === activeFolder)?.name 
    : '전체';

  if (loading) return <p>로딩 중...</p>;
  if (error) return <p className="error-message">{error}</p>;


  return (
    <div>
      <section className="hero">
        <div className="add-link-bar">
          <input 
            type="text" 
            placeholder="링크를 추가해 보세요" 
            value={newLink} 
            onChange={(e) => setNewLink(e.target.value)} 
          />
          <button onClick={handleAddLink}>추가하기</button>
        </div>
      </section>

      <main>
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
            <button>폴더 추가하기</button>
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

