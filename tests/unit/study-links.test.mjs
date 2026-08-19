import assert from "node:assert/strict";
import test from "node:test";

import { SUBJECT_MEDIA_LINKS } from "../../app/study-content.ts";
import { resolveNodeContent } from "../../app/path/node-content.ts";
import { getNodesForSubject } from "../../app/path/path-nodes.ts";

const SUBJECTS = ["korean", "english", "math"];

/**
 * 이 파일이 지키는 것은 "링크가 살아 있는가"가 아니다. 그건 네트워크가 필요하고
 * 오프라인에서 깨진다. 대신 손으로 확인한 결과를 고정해 둔다 — 한 번 확인한
 * 주소가 조용히 다른 것으로 바뀌면 알아차리기 위해서다.
 *
 * 실제로 이 표는 "정승제"라는 이름표를 달고 국어 강좌로 가고 있었고,
 * "수학의샘"이라는 이름표를 달고 과외 홍보 채널로 가고 있었다.
 */

test("과목별 강의 링크는 검색 결과가 아니라 강좌를 가리킨다", () => {
  for (const subject of SUBJECTS) {
    const media = SUBJECT_MEDIA_LINKS[subject];
    assert.ok(media, `${subject}: 링크가 없다`);
    for (const url of [media.ebsUrl, media.youtubeChannelUrl]) {
      assert.ok(
        !url.includes("search_query") && !url.includes("/results?"),
        `${subject}: ${url} 은 검색 결과 주소다. 동생이 누르면 강의가 아니라 검색 화면이 뜬다`,
      );
      assert.ok(url.startsWith("https://"), `${subject}: ${url} 이 https가 아니다`);
    }
  }
});

test("EBSi 주소는 목적지를 정하는 seriesGrpId를 갖는다", () => {
  // seriesId는 서버가 무시한다. grpId가 틀리면 이름표와 다른 과목이 열린다.
  const expectedGroup = {
    korean: "PKG_0187", // 윤혜정의 나비효과
    english: "PKG_0328", // 부동의 NO.1, 주혜연
    math: "PKG_0317", // 정승제의 숨겨진 진심
  };
  for (const subject of SUBJECTS) {
    const { ebsUrl } = SUBJECT_MEDIA_LINKS[subject];
    assert.ok(ebsUrl.includes("ebsi.co.kr"), `${subject}: EBSi 주소가 아니다`);
    assert.ok(
      ebsUrl.includes(`seriesGrpId=${expectedGroup[subject]}`),
      `${subject}: seriesGrpId가 ${expectedGroup[subject]}가 아니다. 손으로 확인한 강좌와 다른 곳으로 간다`,
    );
  }
});

test("과목이 다르면 강의 링크도 달라야 한다", () => {
  // 같은 주소를 세 과목이 공유하고 있으면 이름표만 다른 것이다.
  const ebs = SUBJECTS.map((s) => SUBJECT_MEDIA_LINKS[s].ebsUrl);
  assert.equal(new Set(ebs).size, ebs.length, "과목끼리 같은 EBS 주소를 쓰고 있다");
});

test("칸에 붙는 모든 링크가 검색 주소가 아니다", () => {
  for (const subject of SUBJECTS) {
    for (const node of getNodesForSubject(subject)) {
      const content = resolveNodeContent(node.id);
      assert.ok(content, `${node.id}: 내용을 못 불러온다`);
      for (const link of content.links) {
        assert.ok(
          !link.href.includes("search_query"),
          `${node.id}: ${link.href} 이 검색 결과 주소다`,
        );
        assert.ok(link.title.trim().length > 0, `${node.id}: 링크 이름이 비었다`);
      }
    }
  }
});
