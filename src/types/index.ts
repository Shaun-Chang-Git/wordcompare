// 문서 파일 타입
export interface DocumentFile {
  file: File;
  name: string;
  size: number;
  lastModified: Date;
  content?: string;
  htmlContent?: string;
}

// 비교 옵션 타입
export interface ComparisonOptions {
  compareFormatting: boolean;      // 서식 비교
  caseSensitive: boolean;           // 대/소문자 구분
  compareWhitespace: boolean;       // 공백 비교
  compareTables: boolean;           // 표 비교
  compareHeadersFooters: boolean;   // 머리글/바닥글 비교
  compareFootnotes: boolean;        // 각주 비교
  compareFields: boolean;           // 필드 비교
  compareTextBoxes: boolean;        // 텍스트 상자 비교
  compareComments: boolean;         // 주석 비교
  detailLevel: 'character' | 'word' | 'sentence' | 'paragraph';  // 표시 수준
  displayMode: 'sideBySide' | 'unified' | 'modified';  // 표시 방법
}

// 변경 유형
export enum ChangeType {
  ADDED = 'added',
  DELETED = 'deleted',
  MODIFIED = 'modified',
  MOVED = 'moved',
  FORMAT_CHANGED = 'format_changed'
}

// 변경사항 상태
export enum ChangeStatus {
  PENDING = 'pending',      // 검토 대기 중
  ACCEPTED = 'accepted',    // 수락됨
  REJECTED = 'rejected',    // 거부됨
}

// 개별 변경사항
export interface Change {
  id: string;
  type: ChangeType;
  content: string;
  beforeContent?: string;
  afterContent?: string;
  position: {
    page: number;
    paragraph: number;
    line?: number;
  };
  status?: ChangeStatus;    // 변경사항 상태 추가
  metadata?: {
    author?: string;
    timestamp?: Date;
    description?: string;
  };
}

// 비교 결과
export interface ComparisonResult {
  changes: Change[];
  statistics: {
    totalChanges: number;
    added: number;
    deleted: number;
    modified: number;
    moved: number;
    formatChanged: number;
  };
  originalDocument: DocumentFile;
  modifiedDocument: DocumentFile;
  comparisonDate: Date;
}

// 필터 옵션
export interface FilterOptions {
  types: ChangeType[];
  sortBy: 'position' | 'type' | 'size' | 'time';
  sortOrder: 'asc' | 'desc';
}
