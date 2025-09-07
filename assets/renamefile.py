import os
import argparse

def create_safe_filename(filename):
    """
    호환성이 낮은 문자를 안전한 문자로 변환합니다.

    Args:
        filename (str): 원본 파일명

    Returns:
        str: 안전하게 변환된 파일명
    """
    # 파일 시스템에서 금지되는 주요 문자 목록
    # 추가로 공백이나 다른 문자도 필요에 따라 추가할 수 있습니다.
    invalid_chars = r'<>:"/\|?*'
    
    # 변환 규칙: 금지 문자는 '_'로, 공백은 '_'로 변경
    new_name = filename
    for char in invalid_chars:
        new_name = new_name.replace(char, '_')
    new_name = new_name.replace(' ', '_')
    
    return new_name

def rename_files_in_directory(root_dir):
    """
    지정된 디렉토리와 모든 하위 디렉토리를 순회하며 파일명을 변경합니다.

    Args:
        root_dir (str): 파일명을 변경할 최상위 폴더 경로
    """
    if not os.path.isdir(root_dir):
        print(f"오류: '{root_dir}'는 유효한 폴더가 아닙니다.")
        return

    print(f"'{root_dir}' 폴더 및 하위 폴더의 파일명 검사를 시작합니다...")
    
    # os.walk를 사용하여 디렉토리 트리 순회
    for dirpath, _, filenames in os.walk(root_dir):
        for filename in filenames:
            # 1. 안전한 파일명 생성
            safe_filename = create_safe_filename(filename)
            
            # 2. 파일명이 변경될 필요가 있는지 확인
            if filename != safe_filename:
                original_filepath = os.path.join(dirpath, filename)
                new_filepath_base = os.path.join(dirpath, safe_filename)
                
                # 3. 이름 중복 방지 처리
                counter = 1
                new_filepath = new_filepath_base
                
                # 만약 변경하려는 이름의 파일이 이미 존재한다면, 이름 뒤에 번호를 붙임
                while os.path.exists(new_filepath):
                    name, ext = os.path.splitext(safe_filename)
                    new_filepath = os.path.join(dirpath, f"{name}_{counter}{ext}")
                    counter += 1

                # 4. 파일명 변경 실행
                try:
                    os.rename(original_filepath, new_filepath)
                    print(f"✅ 변경: '{filename}' -> '{os.path.basename(new_filepath)}'")
                except OSError as e:
                    print(f"❌ 오류: '{filename}' 파일명 변경 실패 - {e}")

    print("\n모든 작업이 완료되었습니다.")


if __name__ == '__main__':
    # 명령줄에서 폴더 경로를 인자로 받을 수 있도록 설정
    parser = argparse.ArgumentParser(description="폴더 내 파일명의 특수문자를 안전한 문자로 변경하는 스크립트")
    parser.add_argument('directory', type=str, help='작업을 시작할 최상위 폴더 경로')
    
    args = parser.parse_args()
    
    # 메인 함수 실행
    rename_files_in_directory(args.directory)