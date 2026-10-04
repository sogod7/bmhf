# Vercel 배포 안내

이 프로젝트는 빌드 과정이 없는 정적 HTML 사이트다. Vercel 프로젝트의 **Root Directory**를 이 폴더로 지정하면 `index.html`이 기본 페이지로 배포된다.

## Vercel 대시보드 배포

1. 이 폴더를 GitHub 저장소에 올린다.
2. Vercel에서 **Add New → Project**를 선택하고 저장소를 연결한다.
3. Framework Preset은 `Other`, Build Command와 Output Directory는 비워 둔다.
4. 프로젝트 이름을 `bmhf`로 설정한다. 사용 가능하면 기본 주소는 `https://bmhf.vercel.app`다.
5. Deploy를 실행한다.

## CLI 배포

```powershell
npm install -g vercel
vercel
vercel --prod
```

첫 실행 시 프로젝트 이름으로 `bmhf`를 입력한다. 이미 다른 계정에서 사용 중이면 Vercel이 다른 이름을 요구하므로 `bmhf-kr` 같은 대체 이름을 사용한다.

## 배포 전 확인

- `contact.html`의 문의 폼은 현재 화면 확인용이며 실제 메일 또는 CRM 전송 기능은 없다.
- 새로 생성한 이미지는 솔루션용 콘셉트 이미지다. 실제 납품 사례 페이지에는 승인된 원본 사진·영상 프레임으로 교체한다.
- 기존 운영 사이트 URL을 새 사이트로 옮길 때는 도메인 연결 후 개별 URL의 301 리디렉션을 별도로 설정한다.
